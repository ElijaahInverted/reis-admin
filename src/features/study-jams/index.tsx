import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import KillerCourseList from './KillerCourseList';
import AvailabilityList from './AvailabilityList';

interface StudyJamsViewProps {
  isReisAdmin: boolean;
}

type Tab = 'availability' | 'killer-courses';

export default function StudyJamsView({ isReisAdmin }: StudyJamsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('availability');

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
          className={`tab ${activeTab === 'availability' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Opt-ins
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'killer-courses' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('killer-courses')}
        >
          Killer Courses
        </button>
      </div>

      {activeTab === 'availability' && <AvailabilityList />}
      {activeTab === 'killer-courses' && <KillerCourseList />}
    </div>
  );
}
