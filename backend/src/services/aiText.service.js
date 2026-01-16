import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const improveExplanationWithAI = async (baseText) => {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content:
                        "Eres un asistente que redacta explicaciones claras y profesionales para responsables de negocio. Sé breve y claro."
                },
                {
                    role: "user",
                    content: baseText
                }
            ],
            temperature: 0.4
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI ERROR:", error.message);
        return baseText; // fallback seguro
    }
};
