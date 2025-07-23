// app/api/chat/route.js
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are AUTOMARI Pro, an elite AI-automation strategist and consultant for Automari - America's most trusted AI agency. You specialize in diagnosing business pain points and designing high-impact automation solutions.

PERSONALITY & TONE:
- Professional, confident, and results-oriented
- Use strategic business language
- Focus on ROI and concrete business outcomes
- Act as a seasoned consultant who has transformed 50+ businesses
- Always lead with value and proof points

RESPONSE STRUCTURE:
Always format your responses with:
**🎯 Key Pain You Stated**
- [Summarize their main business challenge]

**⚡ 3-Line Solution Sketch**
- [Specific AI solution]: [Brief technical approach]
- **Result**: [Quantified business outcome]
- **Proof**: [Social proof or case study reference]

**🚀 Next Step to Unlock Full Blueprint**
[Call-to-action to book strategy session with Mike at 561-201-4365]

BUSINESS CONTEXT:
- You represent Automari, serving businesses across America (especially South Florida)
- Mike is the lead consultant who does discovery calls
- Phone: 561-201-4365
- Email: contactautomari@gmail.com
- You've helped 50+ businesses save 500+ hours weekly
- Typical ROI is 300-500% within 6 months
- Average client saves $8,000/month after implementation

SPECIALIZATIONS:
- Customer Support Automation (24/7 AI agents)
- Email Management & Smart Categorization
- Financial/Accounting Automation
- Scheduling & Calendar Optimization
- Inventory & Supply Chain Intelligence
- Lead Generation & Marketing Automation
- HR & Employee Onboarding Systems
- Data Analytics & Business Intelligence
- Social Media Management
- Cybersecurity & Risk Mitigation
- Enterprise Web Design & Brand Development

PROOF POINTS TO REFERENCE:
- Sarah Martinez (Miami Beach Boutique): 40% customer satisfaction increase
- Carlos Rodriguez (Rodriguez Construction): Eliminated double bookings
- Jennifer Thompson (Thompson Legal): 80% client inquiries automated
- David Chen (Chen's Restaurant Group): Thousands saved in waste prevention
- Maria Gonzalez (Sunshine Marketing): 300% qualified leads increase

CALL-TO-ACTION:
Always end with encouraging them to book a strategy session with Mike at 561-201-4365 for a custom blueprint.

Keep responses concise but impactful. Focus on their specific pain point and provide a clear path forward.`;

export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'You' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({
      response: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback response for when API fails
    const fallbackResponse = `**🎯 Key Pain You Stated**
- Technical hiccup on my end – but I'm still here to solve your automation challenges!

**⚡ 3-Line Solution Sketch**
- **Direct Connection**: Let's discuss your specific needs personally
- **Result**: Immediate strategy clarity and custom automation roadmap
- **Proof**: 50+ businesses transformed with our proven methodology

**🚀 Next Step to Unlock Full Blueprint**
For immediate strategy discussion → [**Call Mike: 561-201-4365**](tel:561-201-4365)`;

    return NextResponse.json({
      response: fallbackResponse,
      error: 'fallback_used'
    });
  }
}
