const FormSection = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>註：標示 <span className="text-red-500">*</span> 為必填欄位</p>
      </div>
    </div>
  );
};

export default FormSection;

// 輸入欄位組件
export const FormField = ({ label, required, children, fullWidth = false }) => {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
};

// 輸入框樣式
export const inputClassName = "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

// 下拉選單樣式
export const selectClassName = "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

// 日期時間輸入框樣式
export const dateTimeClassName = "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"; 