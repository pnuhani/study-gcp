import PropTypes from 'prop-types';

export default function Loader({ size = "medium", className = "" }) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-3",
    large: "h-12 w-12 border-4"
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-gray-300 border-t-[#3a5a78] ${sizeClasses[size]}`}></div>
    </div>
  );
}

Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};