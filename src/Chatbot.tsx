import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { questionTree } from './questionTree';
import { QuestionNode, QuestionType, OpenEndedInputType, Responses, ChatMessage } from './types';
import './App.css'; // We'll create this for styling
import FinancialReport, { ReportData } from './FinancialReport'; // Import the new component and its data type

const Chatbot: React.FC = () => {
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('start_chat');
  const [responses, setResponses] = useState<Responses>({});
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null); // State for storing report data
  const chatContainerRef = useRef<HTMLDivElement>(null);

  interface ApiResult {
    message?: string;
    details?: string | Record<string, unknown>;
    source?: string;
    error?: string;
    [key: string]: any; // Allow other properties
  }


  const currentQuestion: QuestionNode = questionTree[currentQuestionId];

  const submitForm = useCallback(async (formData: Responses) => {
    setIsSubmitting(true);
    setChatHistory(prev => [
      ...prev,
      {
        id: `submission-status-${Date.now()}`,
        sender: 'bot',
        text: 'Submitting your information, please wait...',
        questionId: 'submission_status'
      }
    ]);

    try {
      // Directly call the external API
      const externalApiUrl = 'https://localhost:7068/api/leads';
      console.log(`Attempting to call external API: ${externalApiUrl}`);

      // Clone the formData to avoid mutating the original state directly
      const submissionData = JSON.parse(JSON.stringify(formData));

      // Hardcode frequencies for other_income types if their amounts are present
      if (submissionData.other_income) {
        if (submissionData.other_income.rental && submissionData.other_income.rental.amount !== undefined) {
          submissionData.other_income.rental.frequency = "weekly";
        } else if (submissionData.other_income.rental) { // If rental object exists but no amount, remove it or ensure it's structured if API expects it even with 0
            // If API expects rental object even with 0 amount and frequency, initialize it
            // submissionData.other_income.rental = { amount: 0, frequency: "weekly" };
        }

        if (submissionData.other_income.dividends && submissionData.other_income.dividends.amount !== undefined) {
          submissionData.other_income.dividends.frequency = "yearly";
        }

        if (submissionData.other_income.centrelink && submissionData.other_income.centrelink.amount !== undefined) {
          submissionData.other_income.centrelink.frequency = "fortnightly";
        }

        if (submissionData.other_income.other && submissionData.other_income.other.amount !== undefined) {
          submissionData.other_income.other.frequency = "yearly";
        }
        
        if (submissionData.partner_name === undefined) { // Check if it's undefined, not just empty string
          submissionData.partner_name = ""; // API expects the field, even if empty
        }
      }

      console.log("Attempting to send the following data to external API:", JSON.stringify(submissionData, null, 2));
      const apiResponse = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          // 'Access-Control-Allow-Origin': '*', // This header is set by the server, not the client.
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      // Try to parse the response as JSON.
      // Our /api/submit (from the changes above) should always return JSON.
      const resultText = await apiResponse.text(); // Get text first for robust error logging
      let resultJson: ApiResult;

      try {
        resultJson = JSON.parse(resultText);
      } catch (e) {
        // This case means the external API returned non-JSON
        console.error("CRITICAL: External API returned non-JSON response. Raw text:", resultText);
        // Log the raw text to the console for debugging
        throw new Error(`External API error. Received: ${resultText.substring(0, 200)}...`);
      }

      console.log("Parsed response from external API:", resultJson); // Log the entire parsed JSON

      if (!apiResponse.ok) {
        // apiResponse.ok is false, so resultJson should be an error object from /api/submit
        // e.g., { message: "...", details: "...", source: "..." }
        const errorMsg = resultJson.message || `Submission failed with status: ${apiResponse.status}`;
        const errorDetails = resultJson.details || (resultJson.error && typeof resultJson.error === 'string' ? resultJson.error : '');
        
        console.error("Submission Error from external API. Message:", errorMsg, "Details:", errorDetails, "Source:", resultJson.source);
        
        let displayError = `Submission failed: ${errorMsg}`;
        // Check if the details from the external API look like HTML
        if (errorDetails && typeof errorDetails === 'string' && errorDetails.trim().toLowerCase().startsWith("<!doctype html")) {
            displayError += " (The external API returned an HTML error page. Check server logs for /api/submit and the external API.)";
        } else if (errorDetails) {
            displayError += ` Details: ${String(errorDetails).substring(0,150)}...`;
        }

        setChatHistory(prev => [...prev, { id: `submission-error-${Date.now()}`, sender: 'bot', text: displayError, questionId: 'submission_error' }]);
        setError(displayError);
        return; // Important to return here after handling error
      }

      // If apiResponse.ok is true, resultJson is the success data (likely from the external API)
      // The external API directly returns the report data.
      const receivedReportData: ReportData = resultJson as ReportData;

      setReportData(receivedReportData);
      setChatHistory(prev => [...prev, {
        id: `submission-success-${Date.now()}`,
        sender: 'bot',
        text: 'Your financial report has been generated and is displayed below.',
        questionId: 'submission_success'
      }]);
      console.log("Submission successful. Report data received:", receivedReportData);
      setIsSubmitting(false); // Allow UI to update from "Processing..."

    } catch (err) {
      console.error('Client-side submission error (Chatbot.tsx catch):', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected client-side error occurred during submission.';
      setChatHistory(prev => [...prev, { id: `submission-error-${Date.now()}`, sender: 'bot', text: `Submission failed: ${errorMessage}`, questionId: 'submission_error' }]);
      setError(`Submission failed: ${errorMessage}`);
    }
    // Not resetting setIsSubmitting to false to prevent re-submission from useEffect,
    // as the chat flow naturally ends here.
  }, [setIsSubmitting, setChatHistory, setError, setReportData]); // Added setReportData

  useEffect(() => {
    if (currentQuestion && !currentQuestion.isEndPoint) {
      setChatHistory(prev => [
        ...prev,
        {
          id: `${currentQuestion.id}-${Date.now()}`,
          sender: 'bot',
          text: currentQuestion.text,
          questionId: currentQuestion.id
        }
      ]);
    } else if (currentQuestion && currentQuestion.isEndPoint) {
       setChatHistory(prev => [
        ...prev,
        {
          id: `${currentQuestion.id}-${Date.now()}`,
          sender: 'bot',
          text: currentQuestion.text, // Display final message
          questionId: currentQuestion.id
        }
      ]);
      // Trigger submission if it's the end point, not already submitting, and there are responses
      if (!isSubmitting && Object.keys(responses).length > 0 && !reportData) { // Added !reportData to prevent re-submission
        console.log("Chat ended. Final responses for submission:", responses);
        submitForm(responses);
      }
    }
  }, [currentQuestionId, responses, isSubmitting, submitForm, currentQuestion, reportData]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [chatHistory]);

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
    });
    return {...obj}; // Return new object to trigger re-render
  };

  const validateInput = (value: string, inputType?: OpenEndedInputType): string | null => {
    if (!value.trim() && currentQuestion.type === QuestionType.OPEN_ENDED && currentQuestion.inputType !== OpenEndedInputType.TEXT && currentQuestion.id !== 'partner_name') { // Partner name can be empty if not applicable
        // Allow empty for some optional fields if needed, or make validation stricter
        if (currentQuestion.dataKey && !currentQuestion.dataKey.includes("bonus") && !currentQuestion.dataKey.includes("other_income") && !currentQuestion.dataKey.includes("loan_owed") && !currentQuestion.dataKey.includes("loan_repayment")) {
           // return "This field cannot be empty."; // Example: make some fields mandatory
        }
    }
    if (inputType === OpenEndedInputType.EMAIL) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address.";
      }
    }
    if (inputType === OpenEndedInputType.CURRENCY || inputType === OpenEndedInputType.NUMBER) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return "Please enter a valid number.";
      }
      if (numValue < 0) {
        return "Value cannot be negative.";
      }
    }
    if (currentQuestion.validate) {
        return currentQuestion.validate(value);
    }
    return null;
  };

  const processAnswer = (answer: string) => {
    setError(null);
    const validationError = validateInput(answer, currentQuestion.inputType);
    if (validationError) {
      setError(validationError);
      return;
    }

    setChatHistory(prev => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: answer }]);

    let updatedResponses = { ...responses };
    if (currentQuestion.dataKey) {
      let valueToStore: string | number | boolean = answer;

      // Define keys that should store boolean values
      const booleanDataKeys = [
        "investment_properties.owns",
        "shares.owns",
        "other_loans.has_credit_cards",
        "other_loans.has_hecs",
        "other_loans.has_car_loans"
        // Add any other dataKeys that expect a boolean from a "Yes"/"No" answer
      ];

      if (booleanDataKeys.includes(currentQuestion.dataKey)) {
        if (answer.toLowerCase() === 'yes') {
          valueToStore = true;
        } else if (answer.toLowerCase() === 'no') {
          valueToStore = false;
        }
        // If answer is neither "yes" nor "no", it might be an issue with question options or a different input type.
        // This primarily handles "Yes"/"No" string answers for boolean fields.
      } else if (currentQuestion.inputType === OpenEndedInputType.CURRENCY || currentQuestion.inputType === OpenEndedInputType.NUMBER) {
        valueToStore = parseFloat(answer) || 0;
      }
      updatedResponses = setNestedValue(updatedResponses, currentQuestion.dataKey, valueToStore);
      setResponses(updatedResponses);
    }

    const nextQuestionId = currentQuestion.next(answer, updatedResponses);
    setCurrentQuestionId(nextQuestionId);
    setInputValue('');
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentQuestion.type === QuestionType.OPEN_ENDED && inputValue.trim()) {
      processAnswer(inputValue);
    }
  };

  const handleOptionClick = (option: string) => {
    processAnswer(option);
  };

  if (!currentQuestion) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className={`chatbot-container mx-auto p-4 ${reportData ? 'max-w-4xl' : 'max-w-lg'}`}> {/* Adjust width if report is shown */}
      {/* Chat history is always visible, report appears below it */}
      <div className={`border border-slate-300 rounded-lg shadow-lg bg-white ${reportData ? 'mb-6' : ''}`}>
        <div ref={chatContainerRef} className="chat-history mb-4 p-4 h-96 overflow-y-auto border-b border-slate-300 bg-slate-50 rounded-t-lg">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`chat-message mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-sky-900 text-white' : 'bg-slate-200 text-neutral-800'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {!reportData && (
          <div className="p-4">
            {!currentQuestion.isEndPoint && !isSubmitting && (
              <div className="input-area">
                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options && (
                  <div className="options-container space-y-2">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QuestionType.OPEN_ENDED && (
                  <form onSubmit={handleFormSubmit} className="flex space-x-2">
                    <input
                      type={currentQuestion.inputType === OpenEndedInputType.EMAIL ? 'email' :
                            currentQuestion.inputType === OpenEndedInputType.CURRENCY || currentQuestion.inputType === OpenEndedInputType.NUMBER ? 'number' :
                            'text'}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentQuestion.placeholder || "Type your answer..."}
                      className="flex-grow p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required={currentQuestion.inputType !== OpenEndedInputType.TEXT || currentQuestion.id === 'details_name' || currentQuestion.id === 'details_email'}
                      min={currentQuestion.inputType === OpenEndedInputType.CURRENCY || currentQuestion.inputType === OpenEndedInputType.NUMBER ? 0 : undefined}
                      step={currentQuestion.inputType === OpenEndedInputType.CURRENCY ? "0.01" : currentQuestion.inputType === OpenEndedInputType.NUMBER ? "1" : undefined}
                    />
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Send
                    </button>
                  </form>
                )}
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
            )}
            {currentQuestion.isEndPoint && isSubmitting && (
              <p className="text-center text-teal-600 py-4">Processing your request...</p>
            )}
          </div>
        )}
      </div>

      {reportData && (
        <FinancialReport data={reportData} />
      )}
    </div>
  );
};

export default Chatbot;