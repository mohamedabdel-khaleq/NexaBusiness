import { useEffect, useState } from "react";
import API from "../services/api";

function ApiTest() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await API.get("/health");
        setMessage(response.data.message);
      } catch (error) {
        console.error(error);
        setMessage("API connection failed");
      }
    };

    checkApi();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-green-600">
        {message}
      </h1>
    </div>
  );
}

export default ApiTest;