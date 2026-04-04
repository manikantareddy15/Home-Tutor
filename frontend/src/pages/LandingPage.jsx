import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, MessageSquare, Clock, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Custom hook for intersection observer
const useInView = (ref, options = {}) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isInView;
};

// Countup Number Component
const CountupNumber = ({ target, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Parse target number
      const numTarget = parseInt(target.toString().replace(/[^0-9]/g, ''));
      const current = Math.floor(numTarget * progress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <p ref={ref} className="text-4xl font-black text-blue-600">
      {count.toLocaleString()}{suffix}
    </p>
  );
};

// Timeline Item Component
const TimelineItem = ({ position, title, description, icon, colorClass, borderClass, circleColor, isFirst, isLast }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  if (position === "left") {
    return (
      <div ref={ref} className={`timeline-item relative py-4 lg:py-6 ${isInView ? 'in-view' : ''}`}>
        <div className="flex items-center gap-0 lg:gap-12">
          {/* Content - Left Side */}
          <div className="w-full lg:w-6/12 lg:text-right pr-2 lg:pr-48">
            <div className={`bg-gradient-to-br ${colorClass} p-6 rounded-xl border-2 ${borderClass} hover:shadow-2xl hover:scale-105 transition-all duration-300 h-auto`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl flex-shrink-0">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed font-medium tracking-wide">{description}</p>
            </div>
          </div>

          {/* Center Tick Mark */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
            <div className={`w-10 h-10 ${circleColor} rounded-full shadow-lg border-4 border-gray-50 flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Empty Space - Right Side */}
          <div className="w-full lg:w-6/12"></div>
        </div>
      </div>
    );
  }

  // Right position
  return (
    <div ref={ref} className={`timeline-item relative py-4 lg:py-6 ${isInView ? 'in-view' : ''}`}>
      <div className="flex items-center gap-0 lg:gap-12">
        {/* Empty Space - Left Side */}
        <div className="w-full lg:w-6/12"></div>

        {/* Center Tick Mark */}
        <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
          <div className={`w-10 h-10 ${circleColor} rounded-full shadow-lg border-4 border-gray-50 flex items-center justify-center`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Content - Right Side */}
        <div className="w-full lg:w-6/12 lg:text-left pl-2 lg:pl-48">
          <div className={`bg-gradient-to-br ${colorClass} p-6 rounded-xl border-2 ${borderClass} hover:shadow-2xl hover:scale-105 transition-all duration-300 h-auto`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl flex-shrink-0">{icon}</div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed font-medium tracking-wide">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <style>{`
        @keyframes slideUpFromBelow {
          0% {
            opacity: 0;
            transform: translateY(80px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateY(80px);
          }
        }

        .timeline-item {
          opacity: 0;
          transform: translateY(80px);
        }

        .timeline-item.in-view {
          animation: slideUpFromBelow 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .timeline-item:nth-child(1).in-view { animation-delay: 0s; }
        .timeline-item:nth-child(2).in-view { animation-delay: 0.25s; }
        .timeline-item:nth-child(3).in-view { animation-delay: 0.5s; }
        .timeline-item:nth-child(4).in-view { animation-delay: 0.75s; }
        .timeline-item:nth-child(5).in-view { animation-delay: 1s; }
        .timeline-item:nth-child(6).in-view { animation-delay: 1.25s; }

        .timeline-container {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 1024px) {
          .timeline-container::before {
            content: '';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 1.5rem;
            bottom: 1.5rem;
            width: 2px;
            border-left: 2px dashed rgb(191, 219, 254);
            pointer-events: none;
            z-index: 0;
          }
        }

        @media (max-width: 1023px) {
          .timeline-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 lg:px-16 py-6 lg:py-8 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <img src="/home_logo.jpg" alt="Home-Tutor Logo" className="w-12 h-12 rounded-full object-cover" />
          </div>
          <span className="text-3xl font-bold text-blue-600">HomeTutor</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#features" className="text-gray-700 hover:text-blue-600"><b>Features</b></a>
          <a href="#courses" className="text-gray-700 hover:text-blue-600"><b>Courses</b></a>
          <a href="#about" className="text-gray-700 hover:text-blue-600"><b>About</b></a>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <b>Login</b>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-16 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Education</span> <br />
              <span className="text-blue-600 text-5xl lg:text-6xl">Feel Like Real Classroom</span>
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl mb-8 font-light leading-relaxed max-w-lg">
              <b>Connect with experienced tutors, schedule personalized lessons, and learn at your own pace. Quality education made accessible and affordable for everyone.</b>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login")}
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Image with Design Background */}
          <div className="flex justify-center relative">
            {/* Decorative Background Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-200 via-blue-100 to-purple-200 rounded-full filter blur-3xl opacity-60 absolute"></div>
              <div className="w-80 h-80 bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full filter blur-2xl opacity-40 absolute"></div>
            </div>

            {/* Decorative Shapes */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 blur-lg"></div>
            <div className="absolute bottom-20 left-5 w-32 h-32 bg-purple-400 rounded-full opacity-15 blur-lg"></div>
            <div className="absolute top-1/2 right-0 w-24 h-24 bg-cyan-300 rounded-full opacity-20 blur-lg"></div>

            {/* Image */}
            <img
              src="/mainchild.jpg"
              alt="Learning with Home-Tutor"
              className="w-full max-w-2xl h-auto object-contain relative z-10"
            />
          </div>
        </div>

      </section>

      {/* About Our Tutors Section */}
      <section className="px-6 lg:px-16 pt-2 pb-20 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left - Image */}
          <div className="flex justify-start relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-200 via-blue-100 to-purple-200 rounded-full filter blur-3xl opacity-60 absolute"></div>
              <div className="w-80 h-80 bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full filter blur-2xl opacity-40 absolute"></div>
            </div>

            {/* Decorative Shapes */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 blur-lg"></div>
            <div className="absolute bottom-20 left-5 w-32 h-32 bg-purple-400 rounded-full opacity-15 blur-lg"></div>
            <div className="absolute top-1/2 right-0 w-24 h-24 bg-cyan-300 rounded-full opacity-20 blur-lg"></div>

            <img
              src="/tutor1.jpg"
              alt="About Our Tutors"
              className="w-full max-w-md h-auto rounded-2xl object-cover relative z-10"
            />
          </div>

          {/* Right - Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-6">About Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Tutors</span></h2>
            <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-6 font-semibold">
              Our tutors are passionate educators with verified academic credentials. Each one undergoes a rigorous selection process to ensure top-quality teaching standards and personalized attention.
            </p>

            <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-8 font-semibold">
              They tailor lessons to your learning style, pace, and goals. Our tutors genuinely care about your progress and provide additional resources and ongoing support.
            </p>

          </div>
        </div>
      </section>

      {/* Features Section - Alternating Timeline */}
      <section id="features" className="px-6 lg:px-16 py-20 bg-gray-50">
        <h2 className="text-5xl lg:text-6xl font-black text-center mb-4 text-gray-900 tracking-tight">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">HomeTutor?</span></h2>
        <p className="text-center text-gray-600 text-lg font-light mb-16 max-w-2xl mx-auto">
          We provide a complete platform for online learning with flexibility, affordability, and quality education.
        </p>

        {/* Timeline Container */}
        <div className="max-w-6xl mx-auto timeline-container">
          {/* Timeline Items */}
          <div className="space-y-0">
            {/* Item 1 - Left */}
            <TimelineItem
              position="left"
              title="Expert Tutors"
              description="Learn from verified and experienced tutors in various subjects and skill levels."
              icon={<Users className="w-6 h-6 text-blue-600" />}
              colorClass="from-blue-50 to-indigo-50"
              borderClass="border-blue-100"
              circleColor="bg-blue-600"
              isFirst={true}
            />

            {/* Item 2 - Right */}
            <TimelineItem
              position="right"
              title="Flexible Schedule"
              description="Book sessions at your convenient time. Learn whenever you want, wherever you are."
              icon={<Clock className="w-6 h-6 text-purple-600" />}
              colorClass="from-purple-50 to-pink-50"
              borderClass="border-purple-100"
              circleColor="bg-blue-600"
            />

            {/* Item 3 - Left */}
            <TimelineItem
              position="left"
              title="Interactive Learning"
              description="Real-time video sessions with direct messaging and personalized lesson plans."
              icon={<Zap className="w-6 h-6 text-green-600" />}
              colorClass="from-green-50 to-emerald-50"
              borderClass="border-green-100"
              circleColor="bg-blue-600"
            />

            {/* Item 4 - Right */}
            <TimelineItem
              position="right"
              title="Verified Quality"
              description="All tutors are verified and reviewed by students for quality assurance."
              icon={<Award className="w-6 h-6 text-orange-500" />}
              colorClass="from-orange-50 to-amber-50"
              borderClass="border-orange-100"
              circleColor="bg-blue-600"
            />

            {/* Item 5 - Left */}
            <TimelineItem
              position="left"
              title="Direct Communication"
              description="Chat with tutors before booking to discuss your learning goals and requirements."
              icon={<MessageSquare className="w-6 h-6 text-cyan-600" />}
              colorClass="from-cyan-50 to-sky-50"
              borderClass="border-cyan-100"
              circleColor="bg-blue-600"
            />

            {/* Item 6 - Right */}
            <TimelineItem
              position="right"
              title="Diverse Subjects"
              description="Find tutors for Math, Science, Languages, Programming, and many more subjects."
              icon={<BookOpen className="w-6 h-6 text-rose-600" />}
              colorClass="from-rose-50 to-red-50"
              borderClass="border-rose-100"
              circleColor="bg-blue-600"
              isLast={true}
            />
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="px-6 lg:px-16 py-20">
        <h2 className="text-5xl lg:text-6xl font-black text-center mb-4 text-gray-900 tracking-tight">Popular Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Areas</span></h2>
        <p className="text-center text-gray-600 text-lg font-light mb-12 max-w-2xl mx-auto">
          Explore various subjects and skills taught by our expert tutors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Mathematics", tutors: "250+" },
            { name: "Science", tutors: "180+" },
            { name: "Programming", tutors: "320+" },
            { name: "Languages", tutors: "280+" },
            { name: "English", tutors: "200+" },
            { name: "History", tutors: "120+" },
            { name: "Art & Design", tutors: "150+" },
            { name: "Music", tutors: "100+" },
          ].map((course, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2 text-gray-900 tracking-tight">{course.name}</h3>
              <p className="text-blue-600 font-semibold">{course.tutors} Tutors Available</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 lg:px-16 py-20 bg-gray-50">
        <h2 className="text-5xl lg:text-6xl font-black text-center mb-4 text-gray-900 tracking-tight">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Users</span></h2>
        <p className="text-center text-gray-600 text-lg font-light mb-14 max-w-2xl mx-auto">
          Trusted by thousands of students and tutors across the country.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition">
            <CountupNumber target="5000" suffix="+" duration={2500} />
            <p className="text-gray-600 font-light mt-2">Active Tutors</p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition">
            <CountupNumber target="15000" suffix="+" duration={2500} />
            <p className="text-gray-600 font-light mt-2">Active Students</p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition">
            <CountupNumber target="50000" suffix="+" duration={2500} />
            <p className="text-gray-600 font-light mt-2">Sessions Completed</p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition">
            <CountupNumber target="98" suffix="%" duration={2500} />
            <p className="text-gray-600 font-light mt-2">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="px-6 lg:px-16 py-20 bg-blue-600 text-white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight">Ready to Start <span className="text-cyan-300">Learning?</span></h2>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100 font-light">
            Join thousands of students who are already learning with Home-Tutor. Connect with expert tutors today and take your education to the next level.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-16 py-12 bg-gray-900 text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/home_logo.jpg" alt="Home-Tutor Logo" className="w-8 h-8" />
              <span className="text-2xl font-black text-white tracking-tight">Home-Tutor</span>
            </div>
            <p className="text-sm font-light text-gray-400">Quality online education made accessible to everyone.</p>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-lg tracking-tight">For Students</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><a href="#" className="hover:text-blue-400">Find Tutors</a></li>
              <li><a href="#" className="hover:text-blue-400">How It Works</a></li>
              <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-lg tracking-tight">For Tutors</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><a href="#" className="hover:text-blue-400">Become a Tutor</a></li>
              <li><a href="#" className="hover:text-blue-400">Earnings</a></li>
              <li><a href="#" className="hover:text-blue-400">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-lg tracking-tight">Company</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><a href="#" className="hover:text-blue-400">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm font-light text-gray-400">
          <p>&copy; 2024 Home-Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
