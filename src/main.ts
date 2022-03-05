import * as core from '@actions/core'
import * as github from '@actions/github'
import {approved} from './approved'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')

    core.debug(JSON.stringify(github.context))

    const octokit = github.getOctokit(token)
    await octokit.rest.repos.createCommitStatus({
      ...github.context.repo,
      sha: github.context.sha,
      state: (await approved(token)) ? 'success' : 'failure',
      context: 'review passing'
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
