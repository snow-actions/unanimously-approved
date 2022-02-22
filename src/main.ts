import * as core from '@actions/core'
import * as github from '@actions/github'
import { PullRequestEvent, PullRequestReviewEvent } from '@octokit/webhooks-definitions/schema'

async function run(): Promise<void> {
    try {
        const token: string = core.getInput('token')

        const { pull_request: pr } = (github.context.eventName == 'pull_request')
            ? github.context.payload as PullRequestEvent
            : github.context.payload as PullRequestReviewEvent

        core.debug(`PR#${pr.number}`)
        core.debug(`requested reviewers: ${pr.requested_reviewers.length}`)

        const octokit = github.getOctokit(token)
        const { data: reviews } = await octokit.pulls.listReviews({
            ...github.context.repo,
            pull_number: pr.number,
            per_page: 100, // TODO: over 100
        })

        core.debug(`reviews: ${reviews.length}`)

        if (reviews.length == 0) {
            throw new Error('There is no reviewers.')
        }

        let latestReviews = reviews.reverse()
            .filter(review => review.user?.id != pr.user.id)
            .filter(review => review.state.toLowerCase() != 'commented')
            .filter((review, index, array) => { // unique
                return array.findIndex(x => review.user?.id === x.user?.id) === index
            })

        latestReviews.forEach(review => {
            core.debug(`${review.user?.login} is ${review.state.toLowerCase()}.`)
        })

        if (!latestReviews.every(review => review.state.toLowerCase() == 'approved')) {
            throw new Error('Some reviewers do not approve.')
        }

        core.debug('All reviewers approve.')
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
