import {useState} from "react";
import ColorPicker from "./ColorPicker";
import {getLinkColor} from "../utils/utils";

function LinkColor({ colorKey, onChange, color }) {
    const [showPicker, setShowPicker] = useState(false);

    const handleDefault = () => {
        onChange(colorKey, getLinkColor(colorKey))
        setShowPicker(false);
    }
    const handleSave = (newColor) => {
        onChange(colorKey, newColor);
        setShowPicker(false);
    }
    const handleCancel = () => {
        setShowPicker(false);
    };

    return (
        <div className="relative inline-block">
            <div className='w-4 h-4 rounded-full border border-white'
                 style={{
                     backgroundColor: color
                 }}
                 onClick={() => setShowPicker(!showPicker)}
            />
            {showPicker && (
                <div className="absolute top-full right-0 mt-2 z-50 ">
                    <ColorPicker
                        color={ color }
                        onDefault={handleDefault}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    )
}

export default LinkColor;