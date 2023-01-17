import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as Github from '@actions/github';

const ghClient = process.env.GITHUB_TOKEN && new Github.GitHub(process.env.GITHUB_TOKEN);

const { GITHUB_REPOSITORY = '' } = process.env;

let execLogs = '';

const execOptions = {
  listeners: {
    stdout: (data: Buffer): void => {
      execLogs += data.toString();
    },
    stderr: (data: Buffer): void => {
      execLogs += data.toString();
    },
  },
};

const git = (args: string[]): Promise<number> => {
  return exec.exec('git', args, execOptions);
};

interface RebaseArgs {
  email: string;
  branchtomerge: string;
  branch: string;
  username: string;
}

const rebase = async (args: RebaseArgs): Promise<void> => {
  await git(['config', '--local', 'user.name', args.username]);
  await git(['config', '--local', 'user.email', args.email]);
  await git(['fetch', '--all']);
  await git(['checkout', args.branch]);
  await git(['merge', '--ff-only', args.branchtomerge]);
  await git(['push', 'origin', `${args.branch}`]);
};

const run = async (): Promise<void> => {
  const branchtomerge = core.getInput('branchtomerge');
  const branch = core.getInput('branch');
  const [owner] = GITHUB_REPOSITORY.split('/');

  const client = ghClient;

  if (!client) throw 'Failed to load Github client from token.';

  const {
    data: { email },
  } = await client.users.getByUsername({ username: owner });

  try {
    await rebase({
      email,
      username: owner,
      branchtomerge,
      branch,
    });
  } catch (e) {
    console.error(e);
    core.setFailed(execLogs);
  }
};

run();
