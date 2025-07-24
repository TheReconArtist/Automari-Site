import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// ✅ REMOVED: const openai = new OpenAI({ ... }) - This was causing the build error

export async function POST(request: NextRequest) {
    try {
        // ✅ FIX: Create OpenAI client INSIDE the function
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const { message, conversationHistory } = await request.json()

        // Build conversation context
        const messages = [
            {
                role: "system",
                content: `You are AUTOMARI Pro, an AI automation strategist for Automari, America's most trusted AI agency. You help businesses identify pain points and design automation solutions.

**Company Info:**
- Company: Automari
- Contact: Mike at 561-201-4365
- Email: contactautomari@gmail.com
- Location: Serving South Florida
- Services: AI agents for customer support, email management, scheduling, accounting, HR, inventory, marketing, analytics, social media, cybersecurity

**Your Role:**
- Diagnose business bottlenecks
- Recommend specific automation solutions
- Highlight ROI and efficiency gains
- Guide users toward booking strategy calls with Mike
- Use professional, results-focused language
- Include specific metrics and benefits

**Response Style:**
- Use bold headers with emoji (e.g., **🎯 Customer Support Transformation**)
- Include bullet points for features/benefits
- Mention specific ROI numbers when relevant
- Always include call-to-action for contacting Mike
- Keep responses conversational but professional
- Use South Florida business examples when appropriate

**Key Solutions to Promote:**
1. Customer Support Automation (24/7 AI assistance)
2. Email Management & Organization
3. Appointment Scheduling Systems
4. Financial Process Automation
5. Lead Generation & Follow-up
6. Inventory Management
7. Data Analytics & Reporting
8. Social Media Management
9. HR & Employee Onboarding
10. Cybersecurity & Risk Mitigation

**Common Business Pain Points to Address:**
- Slow customer response times
- Email overwhelm and disorganization
- Manual scheduling conflicts
- Repetitive data entry tasks
- Lead follow-up delays
- Inventory tracking issues
- Time-consuming reporting
- Social media management burden
- Employee onboarding complexity
- Security vulnerabilities

**Sample ROI Metrics to Use:**
- 60% faster response times
- 40-80% reduction in manual tasks
- $50,000-$200,000 annual savings
- 3-5x ROI within first year
- 90% fewer manual errors

Always end responses with a clear next step and Mike's contact information.`
            }
        ]

        // Add conversation history (limit to last 10 messages for context)
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.slice(-10).forEach((msg: any) => {
                messages.push({
                    role: msg.sender === "You" ? "user" : "assistant",
                    content: msg.text
                })
            })
        }

        // Add current user message
        messages.push({
            role: "user",
            content: message
        })

        const completion = await openai.chat.completions.create({
            model: "gpt-4", // You can change to "gpt-3.5-turbo" for faster/cheaper responses
            messages: messages,
            max_tokens: 600,
            temperature: 0.7,
            presence_penalty: 0.2,
            frequency_penalty: 0.1,
        })

        const response = completion.choices[0]?.message?.content ||
            "I apologize, but I'm having trouble generating a response right now. Please contact Mike directly at 561-201-4365 for immediate assistance with your automation needs."

        return NextResponse.json({ response })

    } catch (error) {
        console.error('OpenAI API error:', error)

        // Return a helpful error message that still promotes the business
        return NextResponse.json({
            error: 'Failed to generate response',
            response: `**🎯 Technical Issue Detected**

I'm experiencing a brief connection issue, but I'm still here to help solve your automation challenges!

**🚀 Direct Solution**
For immediate strategy discussion → [**Call Mike: 561-201-4365**](tel:561-201-4365)

**💡 Common Automation Wins While I Reconnect:**
• **Customer Support** - 24/7 AI assistance, 60% faster responses
• **Email Management** - Smart categorization, auto-responses
• **Scheduling** - Conflict resolution, automated reminders
• **Lead Generation** - Automated nurturing, 300% more qualified leads

**Or email:** contactautomari@gmail.com

Try your message again in a moment, or contact Mike for an immediate consultation!`
        }, { status: 500 })
    }
}

// ✅ FIX: Add this to prevent Next.js from trying to execute during build
export const dynamic = 'force-dynamic'