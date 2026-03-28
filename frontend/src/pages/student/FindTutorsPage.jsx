import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const FindTutorsPage = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    subjects: [],
    modes: [],
    experienceMin: 0,
    experienceMax: 10,
    priceMin: 0,
    priceMax: 200,
    rating: "any"
  });

  const allSubjects = ["Telugu", "Hindi", "English", "Maths"];
  const allModes = ["Online", "Offline"];

  useEffect(() => {
    loadTutors();
  }, [filters, search]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        subjects: filters.subjects.length > 0 ? filters.subjects : undefined,
        modes: filters.modes.length > 0 ? filters.modes : undefined,
        minPrice: filters.priceMin || undefined,
        maxPrice: filters.priceMax || undefined,
        minExp: filters.experienceMin || undefined,
        maxExp: filters.experienceMax || undefined,
      };

      const res = await api.get("/tutors", { params });
      let filteredTutors = res.data.tutors || [];

      // Apply rating filter
      if (filters.rating !== "any") {
        const minRating = parseFloat(filters.rating);
        filteredTutors = filteredTutors.filter(t => t.rating >= minRating);
      }

      setTutors(filteredTutors);
    } catch (err) {
      console.error("Error loading tutors:", err);
      toast.error("Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject) => {
    setFilters(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleModeChange = (mode) => {
    setFilters(prev => ({
      ...prev,
      modes: prev.modes.includes(mode)
        ? prev.modes.filter(m => m !== mode)
        : [...prev.modes, mode]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-40 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tutors by name, subject, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-20">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Filters</h3>

          {/* Subject Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Subject</h4>
            <div className="space-y-2">
              {allSubjects.map(subject => (
                <label key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.subjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-4" />

          {/* Mode Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Mode</h4>
            <div className="space-y-2">
              {allModes.map(mode => (
                <label key={mode} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.modes.includes(mode)}
                    onChange={() => handleModeChange(mode)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-4" />

          {/* Experience Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Experience</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Min: {filters.experienceMin} yrs</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={filters.experienceMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, experienceMin: parseInt(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Max: {filters.experienceMax} yrs</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={filters.experienceMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, experienceMax: parseInt(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Price Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Price / HR (MAX)</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Min: ${filters.priceMin}</label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={filters.priceMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Max: ${filters.priceMax}</label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={filters.priceMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Rating Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Rating</h4>
            <div className="space-y-2">
              {[
                { label: "Any", value: "any" },
                { label: "4.5+", value: "4.5" },
                { label: "4.0+", value: "4.0" }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    value={option.value}
                    checked={filters.rating === option.value}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Tutors Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading tutors...</p>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">No tutors found</p>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {tutors.map(tutor => (
                <div key={tutor._id} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105 p-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-blue-400 flex items-center justify-center mb-3 shadow-md">
                      <span className="text-white text-2xl font-bold">
                        {tutor.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{tutor.fullName}</h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(tutor.rating || 0) ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {(tutor.rating || 0).toFixed(1)} · {Math.floor(Math.random() * 100) + 20} reviews
                      </span>
                    </div>
                  </div>

                  {/* Tutor Details Grid */}
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Experience</span>
                      <span className="font-semibold">{tutor.experienceYears || 0} yrs</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Distance</span>
                      <span className="font-semibold">{(Math.random() * 4 + 0.5).toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Price/hr</span>
                      <span className="font-bold text-blue-600">${tutor.hourlyRate || 0}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Mode</span>
                      <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs font-semibold rounded">
                        {tutor.teachingModes?.[0] || "Online"}
                      </span>
                    </div>
                  </div>

                  {/* Subjects Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects && tutor.subjects.slice(0, 3).map(subject => (
                        <span key={subject} className="px-3 py-1 bg-blue-200 text-blue-700 text-xs font-semibold rounded-full">
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects && tutor.subjects.length > 3 && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                          +{tutor.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <button
                    onClick={() => navigate(`/student/tutor/${tutor._id}`)}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    View Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindTutorsPage;
