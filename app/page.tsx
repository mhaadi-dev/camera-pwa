import Camera from "./Components/Camera";
import InstallPrompt from "./Components/InstallPrompt";
import { PushNotificationManager } from "./Components/PushNotificationManager";

export default function Home() {
  return (
    <main>
      <h1 style={{textAlign:"center", background:"black", color:"white",padding:"1rem",borderRadius:"10px"}}>PWA Camera App</h1>
      <Camera />
      <InstallPrompt/>
      <PushNotificationManager/>
    </main>
  );
}