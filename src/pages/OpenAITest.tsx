import React, { useState } from 'react';
import axios from 'axios';

const OpenAITest: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const expressions = [
    'happy', 'sad', 'angry', 'surprised', 'confused', 'excited', 
    'bored', 'scared', 'amused', 'annoyed'
  ];

  const getRandomExpressions = () => {
    const shuffled = expressions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateImages = async () => {
    console.log('이미지 생성 시작 ㅇㅅㅇ');
    const key = process.env.REACT_APP_OPENAI_KEY;
    const randomExpressions = getRandomExpressions();

    try {
      const imagePromises = randomExpressions.map(async (expression, index) => {
        await sleep(index * 1000); // 각 요청 간 1초 지연
        return axios.post(
          'https://api.openai.com/v1/images/generations',
          {
            "prompt": `a portrait of a person looking ${expression}`,
            "n": 1,
            "size": "1024x1024"
          },
          {
            headers: {
              'Authorization': `Bearer ${key}`,
              // 'Content-Type': 'application/json'
            }
          }
        );
      });

      const responses = await Promise.all(imagePromises);
      const imageUrls = responses.map(response => response?.data?.data[0]?.url);
      console.log({ imageUrls });
      setImages(imageUrls);
    } catch (error) {
      console.error('Error generating images:', error);
      // 재시도 로직 추가
      setTimeout(generateImages, 5000);
    }
  };

  return (
    <div>
      <h1>OpenAI Image Generation</h1>
      <button onClick={generateImages}>Generate Images</button>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {images.map((url, index) => (
          <img key={index} src={url} alt={`Generated ${index}`} style={{ width: '30%', margin: '10px' }} />
        ))}
      </div>
    </div>
  );
};

export default OpenAITest;
