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
  '../../documentation/content/en/entities/Account.md',
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

  console.log(process.env.OPENAI_API_KEY, process.env.OPENAI_ORGANIZATION);

  const chatGpt = new ChatGPT.ClientFetch(
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_ORGANIZATION,
  );

  const messages = [
    {
      role: 'user',
      content: `
You are developing a REST API client for Mastodon in TypeScript.
The Markdown shown below is a document describing the REST API, but you want to convert it to a YAML format file for parsing from your program.
Therefore, please follow the example below to interpret the Markdown and format it into YAML.

== Notes ==
- You can omit \`type\` information.

== Example ==
---
- name: Entity1
  properties:
    - name: prop1
      description: This is property 1
      version_history:
        - version: 1.0.0
          description: added
    - name: prop2
      description: This is property 2
      version_history:
        - version: 1.0.0
          description: Introduced in 1.0.0
- name: Entity2
  properties:
    - name: prop1
      description: This is property 1
      version_history:
        - version: 1.0.0
          description: Added in 1.0.0
        - version: 2.0.0
          description: Changed to be always true in 2.0.0

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
