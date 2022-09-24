import * as core from '@actions/core'
import * as github from '@actions/github'
import {PullRequestEvent, PullRequestReviewEvent} from '@octokit/webhooks-types'

export async function approved(token: string): Promise<boolean> {
  const {pull_request: pr} =
    github.context.eventName == 'pull_request'
      ? (github.context.payload as PullRequestEvent)
      : (github.context.payload as PullRequestReviewEvent)

  core.debug(`PR#${pr.number}`)
  core.debug(`requested reviewers: ${pr.requested_reviewers.length + pr.requested_teams.length}`)

  if (pr.requested_reviewers.length > 0 || pr.requested_teams.length > 0) {
    core.info('Some reviewers are still in review.')
    return false
  }

  const octokit = github.getOctokit(token)
  const {data: reviews} = await octokit.rest.pulls.listReviews({
    ...github.context.repo,
    pull_number: pr.number,
    per_page: 100 // NOTE: seems not over 100
  })

  core.debug(`reviews: ${reviews.length}`)

  if (reviews.length == 0) {
    core.info('There is no reviewers.')
    return false
  }

  let latestReviews = reviews
    .reverse()
    .filter(review => review.user?.id != pr.user.id)
    .filter(review => review.state.toLowerCase() != 'commented')
    .filter((review, index, array) => {
      // unique
      return array.findIndex(x => review.user?.id === x.user?.id) === index
    })

  latestReviews.forEach(review => {
    core.debug(`${review.user?.login} is ${review.state.toLowerCase()}.`)
  })

  if (!latestReviews.every(review => review.state.toLowerCase() == 'approved')) {
    core.info('Some reviewers do not approve.')
    return false
  }

  core.info('All reviewers approve.')
  return true
}
