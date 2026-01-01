const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const generateHeadline = async (content, platform) => {
  try {
    const prompt = `
Generate 3 short, catchy ${platform} post headlines for:
"${content}"

Return ONLY the headlines, one per line.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('🧠 GEMINI RESPONSE:', text);

    return text
      .split('\n')
      .map(h => h.replace(/^[\d\.\-\*]+/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch (err) {
    console.error('❌ GEMINI HEADLINE ERROR:', err);
    throw err;
  }
};

module.exports = { generateHeadline };
