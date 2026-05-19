import Desktop from './Desktop/Desktop';
import Taskbar from './Taskbar/Taskbar';
import './Shell.css';

export default function Shell() {
  return (
    <div className="os-shell">
      <Desktop />
      <Taskbar />
    </div>
  );
}
