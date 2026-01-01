const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze historical post data to find engagement patterns
 */
const analyzeEngagementPatterns = async (historicalPosts) => {
  try {
    const dataForAnalysis = historicalPosts.map(post => ({
      title: post.title,
      platform: post.platform,
      publishedTime: post.publishedTime,
      engagementScore: post.engagementScore,
      metrics: post.metrics,
      hourOfDay: new Date(post.publishedTime).getHours(),
      dayOfWeek: new Date(post.publishedTime).getDay()
    }));

    const prompt = `Analyze these social media posts and their engagement metrics:
    
${JSON.stringify(dataForAnalysis, null, 2)}

Based on this data, provide:
1. Top 3 optimal posting times (specify hour in 24h format and day of week)
2. Key patterns in high-performing content (topics, length, style)
3. Platform-specific insights
4. Predicted engagement score for different time slots

Format your response as valid JSON with this structure:
{
  "optimalTimes": [
    {"hour": 14, "dayOfWeek": 2, "reason": "explanation", "predictedEngagement": 85}
  ],
  "contentPatterns": ["pattern1", "pattern2"],
  "platformInsights": {"Twitter": "insight", "LinkedIn": "insight"},
  "recommendations": "overall recommendations"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are a social media analytics expert. Analyze data and provide actionable insights in JSON format." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw new Error('Failed to analyze engagement patterns');
  }
};

/**
 * Generate catchy headlines based on topic and platform
 */
const generateHeadline = async (contentTopic, platform, topPerformers = []) => {
  try {
    const prompt = `Generate 3 catchy, engaging headlines for a ${platform} post about: "${contentTopic}"

${topPerformers.length > 0 ? `High-performing past headlines on this platform: ${topPerformers.join(', ')}` : ''}

Requirements:
- Make them platform-appropriate (${platform} best practices)
- Include emotional hooks or curiosity gaps
- Keep optimal length for ${platform}
- Use proven engagement techniques

Return as JSON array: ["headline1", "headline2", "headline3"]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are an expert copywriter specializing in social media headlines that drive engagement." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.headlines || result;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw new Error('Failed to generate headlines');
  }
};

/**
 * Predict engagement score for a given time slot
 */
const predictEngagement = async (platform, scheduledTime, contentType) => {
  try {
    const hour = new Date(scheduledTime).getHours();
    const dayOfWeek = new Date(scheduledTime).getDay();

    const prompt = `Predict the expected engagement score (0-100) for a ${contentType} post on ${platform} 
scheduled for ${scheduledTime} (Hour: ${hour}, Day: ${dayOfWeek}).

Consider:
- Platform-specific peak hours
- Day of week patterns
- Content type performance
- General social media trends

Return JSON: {
  "predictedScore": number,
  "confidence": "high/medium/low",
  "reasoning": "brief explanation",
  "alternativeTimes": [{"time": "HH:00", "score": number}]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw new Error('Failed to predict engagement');
  }
};

module.exports = { 
  analyzeEngagementPatterns, 
  generateHeadline,
  predictEngagement
};