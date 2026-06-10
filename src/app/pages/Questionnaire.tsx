import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { backgroundImage, logoImage } from '../lib/assets';
import { AssistActions } from '../components/AssistActions';

const questions = [
  { id: 1, question: 'Have you been coughing lately?', requiresStaffReview: true },
  { id: 2, question: 'Have you had any chest infections recently (like bronchitis or similar)?', requiresStaffReview: true },
  { id: 3, question: 'Have you ever had any eye problems or eye surgeries?', requiresStaffReview: true },
  { id: 4, question: 'Have you ever had any surgery on your chest or stomach area?', requiresStaffReview: true },
  { id: 5, question: 'Have you ever been told you had a blood clot?', requiresStaffReview: true },
  { id: 6, question: 'Has a doctor ever told you that one of your lungs collapsed?', requiresStaffReview: true },
  { id: 7, question: 'Do you currently smoke, or have you smoked in the past?', requiresStaffReview: false },
];

export function Questionnaire() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const handleAnswer = (answer: boolean) => {
    const activeQuestion = questions[currentQuestion];
    const newAnswers = { ...answers, [activeQuestion.id]: answer };
    setAnswers(newAnswers);

    if (answer && activeQuestion.requiresStaffReview) {
      setTimeout(() => navigate('/spirometer/contact-staff'), 250);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered
      setTimeout(() => navigate('/spirometer/step1'), 300);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      <div className="relative w-full h-full flex flex-col items-center justify-between px-16 py-20">
        <AssistActions />
        {/* Header with Logo */}
        <motion.div 
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="w-px h-16 bg-white/30" />
          <h1 className="text-7xl text-white tracking-tight">A Few Questions</h1>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="flex gap-4 border-y border-white/20 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {questions.map((_, index) => (
            <motion.div
              key={index}
              className={`w-16 h-2 rounded-full transition-all ${
                index <= currentQuestion ? 'bg-white' : 'bg-white/20'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.45, duration: 0.5 }}
            />
          ))}
        </motion.div>

        {/* Question Section */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.55 }}
              className="text-center space-y-8"
            >
              <p className="text-2xl text-white/50">Question {currentQuestion + 1} of {questions.length}</p>
              <div className="w-full h-px bg-white/20" />
              <h2 className="text-5xl text-white leading-tight py-12 px-8">
                {questions[currentQuestion].question}
              </h2>
              <div className="w-full h-px bg-white/20" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Answer Buttons */}
        <motion.div 
          className="w-full max-w-4xl space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          <div className="grid grid-cols-2 gap-8">
            <motion.button
              onClick={() => handleAnswer(false)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-12 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
            >
              <span className="text-5xl">No</span>
            </motion.button>
            <motion.button
              onClick={() => handleAnswer(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-12 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
            >
              <span className="text-5xl">Yes</span>
            </motion.button>
          </div>

          {/* Skip */}
          <button
            onClick={() => navigate('/spirometer/step1')}
            className="w-full text-2xl text-white/50 hover:text-white/80 transition-colors py-4"
          >
            Skip Questions
          </button>
        </motion.div>
      </div>
    </div>
  );
}
