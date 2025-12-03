import { CardContent } from "../types";

export const generateCardContent = async (inputText: string, accessKey: string): Promise<CardContent> => {
  if (!accessKey) {
    throw new Error("未提供 Access Key，无法调用服务。");
  }

  try {
    const response = await fetch('/api/generate-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessKey}`
      },
      body: JSON.stringify({ inputText })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data as CardContent;
  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(error.message || "生成内容时发生未知错误");
  }
};
