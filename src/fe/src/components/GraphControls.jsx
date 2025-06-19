import CheckBox from "./Checkbox";
import SwitchButton from './SwitchButton';
import SyncBtn from './SyncBtn';

const GraphControls = ({ is3D, setIs3D, checkbox, handleCheckbox, linkColor, handleLinkColor, handleSync }) => {
  return (
    <>
      <div className="absolute z-20 right-[1rem] top-[5rem] space-y-2">
        <SwitchButton is3D={is3D} setIs3D={setIs3D} />
        <CheckBox
          title="keyword"
          keyName="keyword"
          onChecked={handleCheckbox}
          onColorChange={handleLinkColor}
          tooltip="Connect pages by keyword"
          color={linkColor.keyword}
          checked={checkbox.keyword}
        />
        <CheckBox
          title="rovo"
          keyName="rovo"
          onChecked={handleCheckbox}
          onColorChange={handleLinkColor}
          tooltip="Connect pages by rovo"
          color={linkColor.rovo}
          checked={checkbox.rovo}
        />
        <CheckBox
          title="page hierarchy"
          keyName="hierarchy"
          onChecked={handleCheckbox}
          onColorChange={handleLinkColor}
          tooltip="Connect pages by page hierarchy"
          color={linkColor.hierarchy}
          checked={checkbox.hierarchy}
        />
        <CheckBox
          title="labels"
          keyName="labels"
          onChecked={handleCheckbox}
          onColorChange={handleLinkColor}
          tooltip="Connect pages by page labels"
          color={linkColor.labels}
          checked={checkbox.labels}
        />
      </div>
      <div className="absolute z-10 right-[1rem] top-[16rem]">
        <SyncBtn handleSync={handleSync} />
      </div>
    </>
  );
};

export default GraphControls;
