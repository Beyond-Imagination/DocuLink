import { useEffect, useState } from 'react';
import { CustomPicker } from 'react-color';
import { Alpha, Hue, Saturation } from 'react-color/lib/components/common';
import tinycolor from 'tinycolor2';

const CustomPointer = () => {
  return <div className="w-3 h-3 rounded-full border-[3px] border-[#FFFFFF] bg-transparent drop-shadow-lg" />
};

const CustomPointerLine = () => {
  return <div className="w-3 h-3 rounded-full border-[3px] border-[#FFFFFF] bg-white drop-shadow-lg -translate-x-1.5" />
};

const CustomHexInput = ({ initHex, initAlpha, onChange }) => {
  const [hex, setHex] = useState(initHex);
  const [alpha, setAlpha] = useState(initAlpha * 100);

  useEffect(() => {
    setHex(initHex);
    setAlpha(Math.round(initAlpha * 100));
  }, [initHex, initAlpha]);

  const handleHex = () => {
    const validHex = /^[0-9A-Fa-f]{6}$/.test(hex);
    if (validHex) {
      const color = tinycolor(hex);
      color.setAlpha(alpha);
      onChange(color);
    } else {
      setHex(initHex);
    }
  };

  const handleAlpha = () => {
    const isValidAlpha = /^[0-9]+$/.test(alpha);
    if (isValidAlpha) {
      const data = Math.max(0, Math.min(100, parseInt(alpha)));
      const color = tinycolor(hex);
      color.setAlpha(data * 0.01);
      onChange(color);
    } else {
      setAlpha(Math.round(initAlpha * 100));
    }
  };

  return (
    <div className="flex flex-row gap-1.5 items-center w-full bg-[#D3D3D3] dark:bg-[#1F2937] border border-[#636A72] rounded-lg focus:outline-none px-2">
      <input
        type="text"
        className="w-20 h-6 text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] focus:outline-none"
        value={hex}
        maxLength={6}
        onChange={(e) => setHex(e.target.value)}
        onBlur={handleHex}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleHex();
          }
        }}
      />
      <input
        type="text"
        className="w-10 h-6 text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] focus:outline-none border-l border-[#636A72] ps-1"
        value={alpha}
        maxLength={3}
        onChange={(e) => setAlpha(e.target.value)}
        onBlur={handleAlpha}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAlpha();
          }
        }}
      />
      <span className="absolute right-0 -translate-x-3 text-[#808080] text-xs pointer-events-none">%</span>
    </div>
  );
};

const CustomRGBInput = ({ initRgb, onChange }) => {
  const [rgb, setRgb] = useState(initRgb);
  const [alpha, setAlpha] = useState(Math.round(initRgb.a * 100));

  useEffect(() => {
    setRgb(initRgb);
    setAlpha(Math.round(initRgb.a * 100));
  }, [initRgb.a, initRgb.r, initRgb.g, initRgb.b]);

  const handleRgb = () => {
    const clampByte = (v, type) => {
      const num = parseInt(v);
      if (isNaN(num)) {
        return initRgb[type];
      }
      return Math.min(255, Math.max(0, num));
    };

    const newRgb = {...rgb};
    newRgb.r = clampByte(rgb.r, 'r');
    newRgb.g = clampByte(rgb.g, 'g');
    newRgb.b = clampByte(rgb.b, 'b');
    newRgb.a = alpha;
    setRgb(newRgb);
    const color = tinycolor(newRgb);
    onChange(color);
  };

  const handleAlpha = () => {
    const isValidAlpha = /^[0-9]+$/.test(alpha);
    if (isValidAlpha) {
      const data = Math.max(0, Math.min(100, parseInt(alpha)));
      const color = tinycolor(rgb);
      color.setAlpha(data * 0.01);
      onChange(color);
    } else {
      setAlpha(Math.round(initRgb.a * 100));
    }
  };

  return (
    <div className="flex flex-row gap-1.5 items-center w-full bg-[#D3D3D3] dark:bg-[#1F2937] border-[#636A72] border rounded-lg focus:outline-none px-2">
      <input
        type="text"
        className="w-6 h-6 text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] focus:outline-none"
        value={rgb.r}
        maxLength={3}
        onChange={(e) => {
          const newRgb = {...rgb};
          newRgb.r = e.target.value;
          setRgb(newRgb);
        }}
        onBlur={handleRgb}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleRgb();
          }
        }}
      />
      <input
        type="text"
        className="w-6 h-6 text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] focus:outline-none border-l border-[#636A72] ps-1"
        value={rgb.g}
        maxLength={3}
        onChange={(e) => {
          const newRgb = {...rgb};
          newRgb.g = e.target.value;
          setRgb(newRgb);
        }}
        onBlur={handleRgb}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleRgb();
          }
        }}
      />
      <input
        type="text"
        className="w-6 h-6 text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] focus:outline-none border-l border-[#636A72] ps-1"
        value={rgb.b}
        maxLength={3}
        onChange={(e) => {
          const newRgb = {...rgb};
          newRgb.b = e.target.value;
          setRgb(newRgb);
        }}
        onBlur={handleRgb}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleRgb();
          }
        }}
      />
      <input
        type="text"
        className="w-6 h-6 text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] focus:outline-none border-l border-[#636A72] ps-1"
        value={alpha}
        maxLength={3}
        onChange={(e) => setAlpha(e.target.value)}
        onBlur={handleAlpha}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAlpha();
          }
        }}
      />
      <span className="absolute right-0 -translate-x-3 text-[#808080] text-xs pointer-events-none">%</span>
    </div>
  );
};

const ColorPicker = ({ color, onDefault, onCancel, onSave }) => {
  const [tempColor, setTempColor] = useState(tinycolor(color));
  const [mode, setMode] = useState('hex');

  const handleSaturationChange = (hsv) => {
    const color = tinycolor(hsv);
    setTempColor(color);
  };
  const handleHueChange = (hsl) => {
    const color = tinycolor(hsl);
    setTempColor(color);
  };
  const handleAlphaChange = (rgb) => {
    const color = tinycolor(rgb);
    setTempColor(color);
  };

  return (
    <div className="flex flex-col w-[16rem] bg-[#D3D3D3] dark:bg-[#1F2937] rounded-[0.625rem] drop-shadow-lg justify-center items-center px-1 py-2">
      <div className="relative w-[15rem] h-[8.75rem] rounded-lg overflow-hidden">
        <Saturation
          width="240px"
          height="140px"
          hsl={tempColor.toHsl()}
          hsv={tempColor.toHsv()}
          onChange={handleSaturationChange}
          pointer={CustomPointer}
        />
      </div>
      <div className="flex flex-row items-center w-full gap-2.5 py-2 px-1">
        <div className="w-8 h-8 rounded-lg" style={{backgroundColor: tempColor.toHex8String()}} />
        <div className="flex flex-col gap-2 h-8 w-[12.5rem]">
          <div className="relative h-3 w-full">
            <Hue
              radius="9999px"
              width="192px"
              height="12px"
              hsl={tempColor.toHsl()}
              onChange={handleHueChange}
              pointer={CustomPointerLine}
            />
          </div>
          <div className="relative h-3 w-full">
            <Alpha
              radius="9999px"
              width="192px"
              height="12px"
              style={{ container: { margin: '0' } }}
              rgb={tempColor.toRgb()}
              hsl={tempColor.toHsl()}
              a={tempColor.getAlpha()}
              onChange={handleAlphaChange}
              pointer={CustomPointerLine}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full gap-3 px-1 pb-2">
        <select
          className="text-xs text-[#525252] dark:text-white bg-[#D3D3D3] dark:bg-[#1F2937] border-[#636A72] border rounded-lg focus:outline-none px-2 py-1"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="hex" className="bg-inherit">HEX</option>
          <option value="rgb" className="bg-inherit">RGB</option>
        </select>
        {mode === 'hex' ? (
          <CustomHexInput initHex={tempColor.toHex()} initAlpha={tempColor.getAlpha()} onChange={setTempColor} />
        ) : (
          <CustomRGBInput initRgb={tempColor.toRgb()} onChange={setTempColor} />
        )}
      </div>
      <div className="flex flex-row gap-2.5 w-full px-1">
        <button
          className="flex-1 text-center whitespace-nowrap text-xs text-white dark:text-[#D1D5DB] bg-[#91969C] dark:bg-inherit rounded-[0.25rem] p-0.5"
          onClick={onDefault}
        >
          Restore Defaults
        </button>
        <button
          className="flex-1 text-center text-xs text-white dark:text-[#D1D5DB] bg-[#91969C] dark:bg-inherit rounded-[0.25rem] px-4 py-0.5"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="flex-1 text-center text-xs text-white dark:text-[#D1D5DB] bg-[#3B82F6] rounded-[0.25rem] px-4 py-0.5"
          onClick={() => onSave(tempColor.toHex8String())}
        >
          Save
        </button>
      </div>
    </div>
  );
};


export default CustomPicker(ColorPicker);