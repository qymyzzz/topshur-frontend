import React from "react";

const Dropdown = ({label, options, value, onChange}) => {
     return(
        <div className="selectOption">
        {/* Step 3: Create the dropdown list */}
        <label htmlFor="disease-select">{label}</label>
        <select
          id="disease-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
}

export default Dropdown;