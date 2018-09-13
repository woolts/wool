import alice from 'alice/package';

export default message => `bob/package -- ${alice(message)}`;
