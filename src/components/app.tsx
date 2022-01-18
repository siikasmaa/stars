import { FunctionalComponent, h } from "preact";
import { Github } from "./github";

import { Stars } from "./stars";

const App: FunctionalComponent = () => {
  return (
    <div id="preact_root">
      <Stars />
      <Github />
    </div>
  );
};

export default App;
