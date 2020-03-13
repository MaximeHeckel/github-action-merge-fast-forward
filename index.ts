import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as Github from '@actions/github';

const ghClient = process.env.GITHUB_TOKEN && new Github.GitHub(process.env.GITHUB_TOKEN);

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
  await git(['fetch', 'origin', args.branchtomerge]);
  await git(['fetch', 'origin', args.branch]);
  await git(['checkout', `origin/${args.branch}`]);
  await git(['merge', '--ff-only', `origin/${args.branchtomerge}`, '--allow-unrelated-histories']);
  await git(['push', 'origin', `${args.branch}`]);
};

const run = async (): Promise<void> => {
  const branchtomerge = core.getInput('branchtomerge');
  const branch = core.getInput('branch');
  const context = await Github.context;
  const repo = context.payload.repository!.full_name!.split('/');
  const [owner] = repo!;

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
    await git(['status']);
    await git(['diff']);
    console.error(e);
    core.setFailed(execLogs);
  }
};

run();
