import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { updateFormData } from "../store/hl7FormSlice";
import ErrorBoundary from "../components/ErrorBoundary";
import axios from "axios";

// 導入各段落組件
import MSHSection from "../components/hl7/MSHSection";
import PIDSection from "../components/hl7/PIDSection";
import SPMSection from "../components/hl7/SPMSection";
import SACSection from "../components/hl7/SACSection";
import ORCSection from "../components/hl7/ORCSection";
import OBRSection from "../components/hl7/OBRSection";
import OBXSection from "../components/hl7/OBXSection";

import { generateCompleteHL7Message } from "../utils/hl7MessageGenerator";

const O33Form = () => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.hl7Form);
  const [hl7Message, setHL7Message] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 處理輸入變更
  const handleInputChange = (segment) => (e) => {
    const { id, value } = e.target;
    dispatch(
      updateFormData({
        segment,
        field: id,
        value,
      })
    );
  };

  // 處理表單提交
  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedMessage = generateCompleteHL7Message(formData);
    setHL7Message(generatedMessage);
    setShowModal(true);
  };

  // 複製HL7消息到剪貼簿
  const handleCopy = () => {
    navigator.clipboard.writeText(hl7Message);
    alert("HL7消息已複製到剪貼簿！");
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSend = async () => {
    try {
      const response = await axios.post(
        "/api/hl7/receive",
        { message: hl7Message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("訊息發送成功:", response.data);
      alert("HL7訊息已成功發送！");
      setShowModal(false);
    } catch (error) {
      console.error("發送HL7訊息時發生錯誤:", error);
      alert(`發送失敗: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OML^O33 數位病理工作流程訊息</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorBoundary>
          <MSHSection formData={formData.msh} handleInputChange={handleInputChange("msh")} />
        </ErrorBoundary>

        <ErrorBoundary>
          <PIDSection formData={formData.pid} handleInputChange={handleInputChange("pid")} />
        </ErrorBoundary>

        <ErrorBoundary>
          <SPMSection formData={formData.spm} handleInputChange={handleInputChange("spm")} />
        </ErrorBoundary>

        <ErrorBoundary>
          <SACSection formData={formData.sac} handleInputChange={handleInputChange("sac")} />
        </ErrorBoundary>

        <ErrorBoundary>
          <ORCSection formData={formData.orc} handleInputChange={handleInputChange("orc")} />
        </ErrorBoundary>

        <ErrorBoundary>
          <OBRSection formData={formData.obr} handleInputChange={handleInputChange("obr")} />
        </ErrorBoundary>

        <ErrorBoundary>
          <OBXSection formData={formData.obx} handleInputChange={handleInputChange("obx")} />
        </ErrorBoundary>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            生成 HL7 訊息
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">生成的HL7消息</h2>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <pre className="whitespace-pre-wrap overflow-auto max-h-96">{hl7Message}</pre>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                發送
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                複製
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default O33Form;
