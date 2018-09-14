import alice from 'alice/package';
import * as path from 'path';

export default message =>
  `bob/package -- ${alice(message)} -- ${path.basename('foo')}`;
