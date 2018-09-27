import * as readline from 'readline';

export async function ask(questions) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const asker = (message, callback) =>
    new Promise(resolve =>
      rl.question(message, answer => {
        callback(answer);
        resolve();
      }),
    );

  const answers = {};
  await questions.reduce(
    (promise, question) =>
      promise.then(() => createQuestion(asker, answers, question)),
    Promise.resolve(),
  );

  rl.close();

  return answers;
}

function createQuestion(asker, answers, question) {
  switch (question.type) {
    case 'confirm':
      return createConfirmQuestion(asker, answers, question);

    case 'input':
      return createInputQuestion(asker, answers, question);
  }

  throw new Error(
    `Unrecognised question type on question: ${JSON.stringify(
      question,
      null,
      2,
    )}`,
  );
}

function createConfirmQuestion(asker, answers, question) {
  return asker(`${question.message} (Y/n) `, answer => {
    const formattedAnswer = answer === 'Y' || answer === 'y' || !answer;
    answers[question.name] = formattedAnswer;
  });
}

function createInputQuestion(asker, answers, question) {
  return asker(`${question.message}: `, answer => {
    answers[question.name] = answer;
  });
}
