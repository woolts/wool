import readline from 'readline';

export async function ask(questions) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answers = {};
  await Promise.all(
    questions.map(q => {
      return new Promise(resolve => {
        rl.question(`${q.message} [Y/n]`, answer => {
          const formattedAnswer = answer === 'Y' || answer === 'y' || !answer;
          answers[q.name] = formattedAnswer;
          resolve();
        });
      });
    }),
  );
  rl.close();
  return answers;
}
