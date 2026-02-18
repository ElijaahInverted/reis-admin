import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import SessionList from './SessionList';
import KillerCourseList from './KillerCourseList';

interface StudyJamsViewProps {
  isReisAdmin: boolean;
}

type Tab = 'sessions' | 'killer-courses';

export default function StudyJamsView({ isReisAdmin }: StudyJamsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sessions');

  if (!isReisAdmin) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body items-center text-center py-16">
          <BookOpen className="w-12 h-12 text-error/60 mb-2" />
          <h2 className="card-title text-xl">Přístup odepřen</h2>
          <p className="text-base-content/60 max-w-md">
            Tato stránka je přístupná pouze administrátorům reIS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div role="tablist" className="tabs tabs-box">
        <button
          role="tab"
          className={`tab ${activeTab === 'sessions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessiony
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'killer-courses' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('killer-courses')}
        >
          Killer Courses
        </button>
      </div>

      {activeTab === 'sessions' && <SessionList />}
      {activeTab === 'killer-courses' && <KillerCourseList />}
    </div>
  );
}
