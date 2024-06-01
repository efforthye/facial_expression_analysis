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
    console.log({randomExpressions});

    const makeRequest = async (expression: string, attempt = 0): Promise<string | null> => {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/images/generations',
          {
            "prompt": `a portrait of a beautiful korean girl looking ${expression}`,
            "n": 1,
            "size": "1024x1024"
          },
          {
            headers: {
              'Authorization': `Bearer ${key}`,
            }
          }
        );
        return response?.data?.data[0]?.url || null;
      } catch (error) {
        if (attempt < 3) {
          console.error(`Error generating image (attempt ${attempt + 1}):`, error);
          await sleep(7000); // 7초 지연
          return makeRequest(expression, attempt + 1);
        } else {
          console.error(`Failed to generate image after ${attempt + 1} attempts:`, error);
          return null;
        }
      }
    };

    try {
      const imagePromises = randomExpressions.map((expression, index) => 
        sleep(index * 1000).then(() => makeRequest(expression))
      );

      const imageUrls = await Promise.all(imagePromises);
      const filteredUrls = imageUrls.filter(url => url !== null) as string[];
      console.log({ filteredUrls });
      setImages(filteredUrls);
    } catch (error) {
      console.error('Unexpected error:', error);
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
