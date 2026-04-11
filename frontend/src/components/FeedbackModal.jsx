import React from "react";
import { NavLink, Link } from "react-router-dom";

const FeedbackModal = ({ icon, title, buttons }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-4 shadow-2xl w-full max-w-lg mx-4 relative animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
          {/* Dynamic Icon */}
          <img
            src={icon}
            alt="Modal Icon"
            className="w-32 h-32 mb-6 object-contain"
          />

          {/* Dynamic Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-10 max-w-xs mx-auto leading-snug">
            {title}
          </h2>

          {/* Dynamic Buttons */}
          <div className="flex items-center justify-center gap-4 w-full max-w-md">
            {buttons.map((btn, index) => {
              // Base styles for all buttons
              const baseStyle =
                "flex-1 flex items-center justify-center h-14 font-bold rounded-2xl transition-all cursor-pointer px-6 whitespace-nowrap";

              // Variant specific styles
              const solidStyle =
                "bg-[#6B4EFF] text-white hover:shadow-lg hover:bg-[#583DD9]";
              const outlineStyle =
                "bg-white border border-[#6B4EFF] text-[#6B4EFF] hover:bg-[#6B4EFF]/5";

              const className = `${baseStyle} ${btn.variant === "outline" ? outlineStyle : solidStyle}`;

              // Render as React Router <Link> if 'to' prop is provided
              if (btn.to) {
                return (
                  <NavLink key={index} to={btn.to} className={className}>
                    {btn.label}
                  </NavLink>
                );
              }

              // Otherwise, render as a standard <button> with an onClick handler
              return (
                <button key={index} onClick={btn.onClick} className={className}>
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
