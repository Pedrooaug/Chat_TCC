import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chat from "./../components/chat/Chat";
import { MessageBot, Message } from "./../components/message/message";
import { Bottom } from "./../components/bottom/bottom";
import "./../components/chat/Chat.css";
import "./../App.css";

interface MessageType {
    type: "bot" | "user";
    text: string | JSX.Element;
}

const MainPage: React.FC = () => {
    const [text, setText] = useState<string>("");
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initialMessages: MessageType[] = [
            {
                type: "bot",
                text: (
                    <>
                        Eaí macho! sou o ZéMentira e estou aqui para te ajudar a ver se aquela notícia do seu amigo é verdade mesmo. Mande aí o texto da notícia! 
                        Para saber melhor como que eu funciono, clica aqui{" "}
                        <a onClick={handleSaibaMais} target="blank" className="saiba-mais">Saiba mais</a>.
                    </>
                ),
            },
        ];

        setMessages(initialMessages); 
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSaibaMais = () => {
        // @ts-ignore comment 
        document.getElementsByClassName("saiba-mais")[0].style.color = 'purple';
        const saibaMaisMessages: MessageType[] = [
            {
                type: "bot",
                text: (
                    <>
                        Eu sou um bot que classifica notícias como falsas ou verdadeiras. Por usar modelos de inteligência artificial, minhas informações não são 100% corretas ou mesmo atualizadas, não vou saber responder de forma apropriada sobre eventos muito recentes hein?! Não vai achando que eu sou o dono da razão! 
                    </>
                ),
            },
            {
                type: "bot",
                text: (
                    <>
                        Para que eu consiga te responder melhor, use mensagens sem ponto de interrogação. Por exemplo, ao invés de escrever 'o céu é azul?' escreva 'o céu é azul', que eu entendo melhor! Mas ei, eu tô limitado a questões relacionadas a política brasileira, então se for perguntar de futebol eu não vou responder direito hein?!
                        Ah, e eu trabalho apenas com textos tá? Nada de mandar imagens, vídeos ou links pra mim!
                    </>
                ),
            },
        ]

        setMessages((prevMessages) => [...prevMessages, ...saibaMaisMessages])
    }

    const handleTypingEffect = async (fullMessage: JSX.Element | string) => {
        const addMessagePart = (partialText: JSX.Element | string) => {
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = { type: "bot", text: partialText };
                return updatedMessages;
            });
        };
    
        const isJSX = React.isValidElement(fullMessage);
        if (typeof fullMessage === "string" || !isJSX) {
            // Para strings simples
            const text = typeof fullMessage === "string" ? fullMessage : "";
            let displayedText = "";
            for (let i = 0; i < text.length; i++) {
                displayedText += text[i];
                addMessagePart(displayedText);
                await new Promise((resolve) => setTimeout(resolve, 15)); // Intervalo entre caracteres
            }
        } else if (isJSX) {
            // Para JSX.Element
            const jsxParts = (fullMessage as JSX.Element).props.children;
            let displayedJSX: JSX.Element[] = [];
    
            for (let i = 0; i < jsxParts.length; i++) {
                if (typeof jsxParts[i] === "string") {
                    for (let j = 0; j < jsxParts[i].length; j++) {
                        displayedJSX.push(jsxParts[i][j]);
                        addMessagePart(<>{displayedJSX}</>);
                        await new Promise((resolve) => setTimeout(resolve, 30));
                    }
                } else {
                    const { children, href } = jsxParts[i].props;
                    let linkText = "";
            
                    for (let j = 0; j < children.length; j++) {
                        linkText += children[j];
                        addMessagePart(
                            <>
                                {displayedJSX}
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                    {linkText}
                                </a>
                            </>
                        );
                        await new Promise((resolve) => setTimeout(resolve, 30));
                    }
            
                    displayedJSX.push(
                        <a href={href} target="_blank" rel="noopener noreferrer">
                            {linkText}
                        </a>
                    );
                }
            }
        }
    };
    
    

    const handleSubmit = async (e: React.FormEvent, texto: string) => {
        e.preventDefault();
        setText(texto);

        if (!texto.trim() || isLoading) return;

        setIsLoading(true);

        const userMessage: MessageType = { type: "user", text: texto };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        const loadingMessage: MessageType = { type: "bot", text: <div className="loader"></div> };
        setMessages((prevMessages) => [...prevMessages, loadingMessage]);

        try {
            const response = await axios.post("https://chat-project-iota-smoky.vercel.app/api/classify", { text: texto });
            const prediction = response.data.result;

            const message: JSX.Element =
                prediction === 0 ? (
                    <>
                        Ei rapaz, fica esperto! Meu modelo apontou que a notícia enviada é falsa. Mas não tome minha resposta como verdade absoluta
                        não hein?! Sempre verifique suas informações em agências de checagem de fatos confiáveis, como {" "}
                        <a href="https://www.aosfatos.org/" target="_blank" rel="noopener noreferrer">
                            Agência aos Fatos
                        </a>, {" "}
                        <a href="https://lupa.uol.com.br/" target="_blank" rel="noopener noreferrer">
                            Agência Lupa
                        </a>, e até mesmo nos grandes jornais como {" "}
                        <a href="https://www.opovo.com.br/" target="_blank" rel="noopener noreferrer">
                            O Povo
                        </a>, {" "}
                        <a href="https://www.folha.uol.com.br/" target="_blank" rel="noopener noreferrer">
                            Folha de São Paulo
                        </a>, e {" "}
                        <a href="https://oglobo.globo.com/" target="_blank" rel="noopener noreferrer">
                            O Globo
                        </a> {" "}
                        para confirmar se ela é falsa mesmo.
                    </>
                ) : (
                    <>
                        Rapaz a notícia enviada pode ser verdadeira viu? Meu modelo não apontou como falsa. Mas, eu não sou
                        dono da razão não hein?! Sempre verifique suas informações em agências de checagem
                        de fatos confiáveis, como {" "}
                        <a href="https://www.aosfatos.org/" target="_blank" rel="noopener noreferrer">
                            Agência aos Fatos
                        </a>, {" "}
                        <a href="https://lupa.uol.com.br/" target="_blank" rel="noopener noreferrer">
                            Agência Lupa
                        </a>, e até mesmo nos grandes jornais como {" "}
                        <a href="https://www.opovo.com.br/" target="_blank" rel="noopener noreferrer">
                            O Povo
                        </a>, {" "}
                        <a href="https://www.folha.uol.com.br/" target="_blank" rel="noopener noreferrer">
                            Folha de São Paulo
                        </a>, e {" "}
                        <a href="https://oglobo.globo.com/" target="_blank" rel="noopener noreferrer">
                            O Globo
                        </a> {" "}
                        para confirmar se ela é verdade mesmo.
                    </>
                );

            await handleTypingEffect(message);
        } catch (err) {
            console.error("Erro no React:", err);
            console.error("Message State:", text);
            await handleTypingEffect(<>Ocorreu um erro ao tentar classificar a notícia. Tente novamente mais tarde.</>);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <Chat>
                {messages.map((message, index) => {
                    return message.type === "bot" ? (
                        <MessageBot key={index} text={message.text} />
                    ) : (
                        <Message key={index} text={message.text} />
                    );
                })}
                <div ref={messagesEndRef} />
                <Bottom handleSubmit={handleSubmit} isLoading={isLoading} />
            </Chat>
        </div>
    );
};

export default MainPage;