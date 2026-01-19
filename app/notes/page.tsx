"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useNotesStore } from "@/stores/notes.store";
import { NoteSearchParams } from "@/lib/api/notes.api";
import Link from "next/link";

export default function NotesPage() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    recentNotes,
    searchResults,
    isLoading,
    error,
    fetchRecentNotes,
    searchNotes,
    clearSearchResults,
  } = useNotesStore();

  // Load recent notes on mount
  useEffect(() => {
    fetchRecentNotes(10);
  }, [fetchRecentNotes]);

  // Load search params from URL
  useEffect(() => {
    const query = urlSearchParams.get("q");
    if (!query) return;

    const program = urlSearchParams.get("program");
    const code = urlSearchParams.get("code");
    const year = urlSearchParams.get("year");
    const semester = urlSearchParams.get("semester");

    setSearchQuery(query);
    if (program) setSelectedProgram(program);
    if (code) setCourseCode(code);
    if (year) setSelectedYear(year);
    if (semester) setSelectedSemester(semester);

    const params: NoteSearchParams = {
      query,
      ...(program && { program }),
      ...(code && { courseCode: code }),
      ...(year && { year }),
      ...(semester && { semester }),
    };

    searchNotes(params).then(() => {
      setHasSearched(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSelect = (
    type: "program" | "year" | "semester",
    value: string,
  ) => {
    if (type === "program") setSelectedProgram(value);
    if (type === "year") setSelectedYear(value);
    if (type === "semester") setSelectedSemester(value);
    setActiveDropdown(null);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Allow search with just filters, query is now optional
    if (
      !searchQuery.trim() &&
      !selectedProgram &&
      !courseCode &&
      !selectedYear &&
      !selectedSemester
    ) {
      toast.error("Please enter a search query or select at least one filter");
      return;
    }

    const searchParams: NoteSearchParams = {
      ...(searchQuery.trim() && { query: searchQuery.trim() }),
      ...(selectedProgram && { program: selectedProgram }),
      ...(courseCode && { courseCode: courseCode.toUpperCase() }),
      ...(selectedYear && { year: selectedYear }),
      ...(selectedSemester && { semester: selectedSemester }),
    };

    const urlParams = new URLSearchParams();
    if (searchParams.query) urlParams.set("q", searchParams.query);
    if (searchParams.program) urlParams.set("program", searchParams.program);
    if (searchParams.courseCode) urlParams.set("code", searchParams.courseCode);
    if (searchParams.year) urlParams.set("year", searchParams.year);
    if (searchParams.semester) urlParams.set("semester", searchParams.semester);

    router.push(`?${urlParams.toString()}`, { scroll: false });

    try {
      await searchNotes(searchParams).then(() => {
        setHasSearched(true);
        toast.success("Search completed!");
      });
    } catch {
      toast.error("Search failed. Please try again.");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgram(null);
    setCourseCode("");
    setSelectedYear(null);
    setSelectedSemester(null);
    setHasSearched(false);
    clearSearchResults();
    router.push(window.location.pathname, { scroll: false });
  };

  const displayNotes = hasSearched ? searchResults : recentNotes;
  const sectionTitle = hasSearched ? "Search Results" : "Recently Added Notes";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-100 to-white text-black p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header - Green Theme */}
        <div className="text-center mt-8 mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-[#4ADE80]">Notes</span> Library
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            Find and download comprehensive study notes for your courses.
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="flex justify-center mb-16">
          <form
            onSubmit={handleSearch}
            className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-visible transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20"
          >
            {/* Top Section: Search Input */}
            <div className="flex items-center px-6 py-4 bg-white rounded-t-2xl border-b-2 border-dashed border-gray-200">
              <SearchIcon className="w-6 h-6 text-gray-400 mr-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title, topic..."
                className="w-full text-lg text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                type="submit"
                className="p-2 bg-[#4ADE80] rounded-full text-black hover:bg-green-400 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Section: Filters */}
            <div
              ref={dropdownRef}
              className="bg-green-50 px-6 py-3 flex flex-wrap items-center gap-3 rounded-b-2xl"
            >
              {/* Program Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("program")}
                  className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 ${
                    selectedProgram
                      ? "border-green-400 bg-green-50"
                      : "border-black"
                  } text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none`}
                >
                  {selectedProgram || "Program"}{" "}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {activeDropdown === "program" && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black py-2 z-50 max-h-60 overflow-y-auto">
                    {[
                      "Computer Science",
                      "Law",
                      "Business",
                      "Agriculture",
                      "Medical",
                      "Biotech",
                      "Civil",
                      "Mechanical",
                      "Electrical",
                      "Architecture",
                      "Design",
                      "Pharmacy",
                    ].map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("program", opt)}
                        className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm text-black font-medium border-b border-dashed border-gray-100 last:border-0"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Code Input */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 border-black text-sm font-bold text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-within:ring-2 focus-within:ring-green-400 transition-all">
                <span className="text-gray-500">Code:</span>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CSE101"
                  className="w-24 outline-none text-gray-700 bg-transparent uppercase placeholder:normal-case font-bold"
                />
              </div>

              {/* Semester Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("semester")}
                  className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 ${
                    selectedSemester
                      ? "border-green-400 bg-green-50"
                      : "border-black"
                  } text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none`}
                >
                  {selectedSemester || "Semester"}{" "}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {activeDropdown === "semester" && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black py-2 z-50 max-h-60 overflow-y-auto">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((opt) => (
                      <div
                        key={opt}
                        onClick={() =>
                          handleSelect("semester", `Semester ${opt}`)
                        }
                        className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm text-black font-medium border-b border-dashed border-gray-100 last:border-0"
                      >
                        Semester {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="ml-auto text-sm font-black text-red-500 hover:underline decoration-2 underline-offset-2"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-black">{sectionTitle}</h2>
            {displayNotes && (
              <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-bold">
                {displayNotes.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="text-black font-bold">Loading notes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 text-center">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          ) : displayNotes.length === 0 ? (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-black mb-2">No notes found</h3>
              <p className="text-gray-600 font-medium">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full"
                >
                  {/* Card Header: Program Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-green-200 text-black border-2 border-black rounded-full text-xs font-bold uppercase tracking-wider">
                      {note.program}
                    </span>
                    <div className="text-xs font-bold text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mb-4 flex-grow">
                    <h3 className="text-xl font-black mb-2 line-clamp-2 leading-tight">
                      {note.title}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                        <span className="w-3 h-3 border border-black rounded-full bg-green-400"></span>
                        {note.courseName}
                      </p>
                      <p className="text-sm font-mono text-gray-500 flex items-center gap-2 pl-0.5">
                        {note.courseCode}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats/Info */}
                  <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-auto">
                    <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500">
                      <span>Sem {note.semester}</span>
                      <span>
                        By{" "}
                        {note.userId && typeof note.userId === "object"
                          ? note.userId.username || "User"
                          : "User"}
                      </span>
                    </div>

                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-black text-white rounded-lg font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all border-2 border-transparent hover:border-black hover:bg-white hover:text-black active:translate-y-[1px]"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      View Note
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
