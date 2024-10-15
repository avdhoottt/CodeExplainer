'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown';
import { debounce } from 'lodash'
import CodeEditor from '@uiw/react-textarea-code-editor';
import Spinner from './Spinner'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ModeToggle } from './ModeToggle'

export const CodeExplainer = () => {
    const [input, setInput] = useState('');
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const explainCode = async () => {
        setError('');
        if(input.trim() === '') {
            setExplanation("Input is empty");
            return;
        }
        setLoading(true);
        try {
            const genAi = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
            const model = genAi.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Explain this code in the following format. The explanation should be easy to understand and simple, use real world examples to explain the code:

            1. Programming Language:
            2. Explain the code in detail line by line:

            Here is the code - ${input}. It should not be in markdown.
            `;

            const res = await model.generateContent(prompt);

            setExplanation(res.response.text);
        } catch (error) {
            console.error('Error explaining code:', error);
            setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const debouncedF = debounce(explainCode, 1000);
    const resetAllValues = () => {
        setExplanation('');
        setInput('');
        setError('');
        setLoading(false);
    };

    return (
        <>
            <div className="z-10 h-full overflow-auto">
                <ModeToggle />
                <div className="flex flex-col justify-center items-center h-auto">
                    <h1 className='text-5xl font-bold'>Code <span className='text-blue-500 font-bold'>Explainer</span></h1>
                    <h2 className='z-10 pt-4'>Count = {input.length}</h2>

                    <CodeEditor
                        placeholder='Paste the code'
                        className='mt-10 w-6/12 z-10'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        language='JavaScript'
                        padding={15}
                        style={{
                            fontSize: 18,
                            backgroundColor: "#f5f5f5",
                            fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                            overflow: "auto",
                            borderRadius: "10px"
                        }}
                    />

                    <div className='flex flex-row'>
                        <Button className='m-4 px-4 py-2 z-10 rounded flex items-center' onClick={debouncedF} disabled={loading}>
                            {loading ? <><Spinner /><span className="ml-2">Explaining...</span></> : 'Explain Code'}
                        </Button>
                        <Button className='m-4 px-4 z-10 py-2 bg-red-600 rounded flex items-center' onClick={resetAllValues}>Reset</Button>
                    </div>
                    { explanation ? (
                    <Card className="w-6/12">
                        <CardHeader>
                        <CardTitle>Code Explainer</CardTitle>
                        <CardDescription>Understanding the program line by line.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="h-[300px] overflow-auto rounded border border-gray-200 bg-gray-50 p-4">
                        <pre className="font-mono text-sm">
                            {input.split('\n').map((line, index) => (
                            <div key={index} className="flex">
                                <span className="w-8 text-gray-400">{index + 1}</span>
                                <span className="flex-1">{line}</span>
                            </div>
                            ))}
                        </pre>
                        <div className="mt-4 space-y-2">
                            {explanation.split('\n').map((exp, index) => (
                            <p key={index} className="text-sm">
                                 {exp}
                            </p>
                            ))}
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                    ): (
                        <Card className="w-6/12">
                            <CardHeader>
                                <CardTitle>No Explanation Available</CardTitle>
                                <CardDescription>Please provide code to get an explanation.</CardDescription>
                            </CardHeader>
                        </Card>)
                        }

                </div>
            </div>
            {/* <BackgroundLines className="z-0" /> */}
        </>
    );
}
