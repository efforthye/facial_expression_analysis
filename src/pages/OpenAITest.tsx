import React, { useState } from 'react';
import axios from 'axios';

const OpenAITest: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const apiKey = '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';

  const generateImages = async () => {
    console.log('이미지생성하쟈 ㅇㅅㅇ');
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          "prompt": "a white siamese cat",
          "n": 1,
          "size": "1024x1024"
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            // 'Content-Type': 'application/json'
          }
        }
      );
      console.log({response});

      const imageUrls = response?.data?.data?.map((img: any) => img?.url);
      console.log({imageUrls});
      setImages(imageUrls);
    } catch (error) {
      console.error('Error generating images:', error);
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
