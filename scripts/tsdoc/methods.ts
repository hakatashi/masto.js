/* eslint-disable unicorn/prefer-module */
/* eslint-disable import/no-unresolved */
/* eslint-disable unicorn/template-indent */
import fs from 'node:fs';
import path from 'node:path';
import { stdout } from 'node:process';

// import outdent from 'outdent';
import { ChatGPT } from './chatgpt';

const DOC_PATH = path.join(
  __dirname,
  '../../documentation/content/en/methods/accounts.md',
);

// const SOURCE_PATH = path.join(
//   __dirname,
//   '../../src/mastodon/v1/entities/account.ts',
// );

const removeCodeBlocks = (text: string) => {
  return text.replace(/```[\S\s]*?```/g, 'No example provided');
};

const main = async () => {
  if (process.env.OPENAI_API_KEY == undefined) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const chatGpt = new ChatGPT.ClientFetch(
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_ORGANIZATION,
  );

  const messages = [
    {
      role: 'user',
      content: `
You are developing a REST API client for Mastodon in TypeScript.
The following Markdown document describes the REST API, but you would like to convert the description into a YAML-formatted file so that you can parse it from your program.
Therefore, please follow the example below to interpret the Markdown and format it into YAML.

== Notes ==
Do not include any fields that is not listed in the example

== Example ==
---
- title: Post a new status
	description: Publish a status with the given parameters.
	method: POST
	path: /api/v1/statuses
	returns: "{@link Status}. When \`scheduled_at\` is present, {@link ScheduledStatus} is returned instead."
	oauth: User + \`write:statuses\`
	link: https://docs.joinmastodon.org/methods/statuses/#create
	version_history:
		"0.0.0": "added"
		"2.7.0": "\`scheduled_at\` added"
		"2.8.0": "\`poll\` added"
	parameters:
		status: String. The text content of the \`status\`. If \`media_ids\` is provided, this becomes optional. Attaching a \`poll\` is optional while \`status\` is provided.
		media_ids: Array of String. Include Attachment IDs to be attached as media. If provided, \`status\` becomes optional, and \`poll\` cannot be used.
		poll:
			options: Array of String. Possible answers to the poll. If provided, \`media_ids\` cannot be used, and \`poll[expires_in]\` must be provided.
			expires_in: Integer. Duration that the poll should be open, in seconds. If provided, \`media_ids\` cannot be used, and \`poll[options]\` must be provided.
- title: Post a new status
	description: Publish a status with the given parameters.
	method: POST
	path: /api/v1/statuses
	returns: "{@link Status}. When \`scheduled_at\` is present, {@link ScheduledStatus} is returned instead."
	oauth: User + \`write:statuses\`
	link: https://docs.joinmastodon.org/methods/statuses/#create
	version_history:
		"0.0.0": "added"
		"2.7.0": "\`scheduled_at\` added"
		"2.8.0": "\`poll\` added"
	parameters:
		status: String. The text content of the \`status\`. If \`media_ids\` is provided, this becomes optional. Attaching a \`poll\` is optional while \`status\` is provided.
		media_ids: Array of String. Include Attachment IDs to be attached as media. If provided, \`status\` becomes optional, and \`poll\` cannot be used.
		poll:
			options: Array of String. Possible answers to the poll. If provided, \`media_ids\` cannot be used, and \`poll[expires_in]\` must be provided.
			expires_in: Integer. Duration that the poll should be open, in seconds. If provided, \`media_ids\` cannot be used, and \`poll[options]\` must be provided.

== Documentation ==
${removeCodeBlocks(fs.readFileSync(DOC_PATH, 'utf8'))}`,
    },
  ];

  // eslint-disable-next-line no-console
  messages.map((message) => console.log(message.content + '\n\n'));

  const response = chatGpt.chat({
    model: 'gpt-4',
    temperature: 0,
    stream: true,
    messages,
  });

  for await (const message of response) {
    stdout.write(message.choices[0].delta.content ?? '');
  }
};

main();
