import Camera from "./Components/Camera";
import InstallPrompt from "./Components/InstallPrompt";

export default function Home() {
  return (
    <main>
      <h1>My PWA Camera App</h1>
      <Camera />
      <InstallPrompt/>
    </main>
  );
}