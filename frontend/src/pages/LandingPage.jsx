import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, MessageSquare, Clock, Zap } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-gray-200">
          <div className="text-center">
            <p className="text-4xl font-black text-blue-600">5000+</p>
            <p className="text-gray-600 font-light">Active Tutors</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-blue-600">15000+</p>
            <p className="text-gray-600 font-light">Active Students</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-blue-600">50000+</p>
            <p className="text-gray-600 font-light">Sessions Completed</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-blue-600">98%</p>
            <p className="text-gray-600 font-light">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 lg:px-16 py-20 bg-gray-50">
        <h2 className="text-5xl lg:text-6xl font-black text-center mb-4 text-gray-900 tracking-tight">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Home-Tutor?</span></h2>
        <p className="text-center text-gray-600 text-lg font-light mb-12 max-w-2xl mx-auto">
          We provide a complete platform for online learning with flexibility, affordability, and quality education.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight">Expert Tutors</h3>
            <p className="text-gray-600">Learn from verified and experienced tutors in various subjects and skill levels.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Flexible Schedule</h3>
            <p className="text-gray-600">Book sessions at your convenient time. Learn whenever you want, wherever you are.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Interactive Learning</h3>
            <p className="text-gray-600">Real-time video sessions with direct messaging and personalized lesson plans.</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Verified Quality</h3>
            <p className="text-gray-600">All tutors are verified and reviewed by students for quality assurance.</p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Direct Communication</h3>
            <p className="text-gray-600">Chat with tutors before booking to discuss your learning goals and requirements.</p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Diverse Subjects</h3>
            <p className="text-gray-600">Find tutors for Math, Science, Languages, Programming, and many more subjects.</p>
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
              <span className="text-2xl font-black text-white tracking-tight\">Home-Tutor</span>
            </div>
            <p className="text-sm font-light text-gray-400\">Quality online education made accessible to everyone.</p>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-lg tracking-tight\">For Students</h4>
            <ul className="space-y-2 text-sm font-light\">
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
        <div className="border-t border-gray-700 pt-8 text-center text-sm font-light text-gray-400\">
          <p>&copy; 2024 Home-Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
