import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Tables } from '@/lib/database.types';

type KillerCourse = Tables<'killer_courses'>;

export default function KillerCourseList() {
  const [courses, setCourses] = useState<KillerCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({ course_code: '', course_name: '', faculty: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('killer_courses')
        .select('*')
        .order('course_code');
      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast.error('Chyba načítání předmětů');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.course_code.trim() || !addForm.course_name.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('killer_courses').insert({
        course_code: addForm.course_code.trim(),
        course_name: addForm.course_name.trim(),
        faculty: addForm.faculty.trim() || null,
      });
      if (error) throw error;
      toast.success('Předmět přidán');
      setAddForm({ course_code: '', course_name: '', faculty: '' });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || 'Chyba při ukládání');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (course: KillerCourse) => {
    const newValue = !course.is_active;
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, is_active: newValue } : c))
    );
    const { error } = await supabase
      .from('killer_courses')
      .update({ is_active: newValue })
      .eq('id', course.id);
    if (error) {
      toast.error('Chyba při ukládání');
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, is_active: course.is_active } : c))
      );
    } else {
      toast.success(newValue ? 'Předmět aktivován' : 'Předmět deaktivován');
    }
  };

  const handleDelete = async (course: KillerCourse) => {
    if (!confirm(`Smazat předmět "${course.course_code}"? Tím se smažou i všechny jeho sessiony.`)) return;
    const { error } = await supabase.from('killer_courses').delete().eq('id', course.id);
    if (error) {
      toast.error(error.message || 'Chyba při mazání');
    } else {
      toast.success('Předmět smazán');
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xl px-1 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        Killer Courses
      </h3>

      {/* Inline add form */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end">
            <div className="form-control flex-1 min-w-32">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Kód předmětu *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="např. AF1"
                value={addForm.course_code}
                onChange={(e) => setAddForm((f) => ({ ...f, course_code: e.target.value }))}
                required
              />
            </div>
            <div className="form-control flex-[2] min-w-48">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Název předmětu *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="např. Anglický jazyk I"
                value={addForm.course_name}
                onChange={(e) => setAddForm((f) => ({ ...f, course_name: e.target.value }))}
                required
              />
            </div>
            <div className="form-control flex-1 min-w-32">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Fakulta</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="např. AF"
                value={addForm.faculty}
                onChange={(e) => setAddForm((f) => ({ ...f, faculty: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm gap-1 self-end mb-0.5"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Přidat
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-12 w-full rounded-box opacity-20"></div>
          <div className="skeleton h-12 w-full rounded-box opacity-20"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <BookOpen className="w-10 h-10 text-base-content/30 mb-2" />
            <p className="text-base-content/60">Žádné killer courses</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body p-3 flex-row items-center gap-3">
                <span className="badge badge-outline font-mono text-xs shrink-0">
                  {course.course_code}
                </span>
                <span className="flex-1 font-medium text-sm truncate">
                  {course.course_name}
                </span>
                {course.faculty && (
                  <span className="badge badge-ghost text-xs shrink-0">{course.faculty}</span>
                )}
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={course.is_active}
                  onChange={() => handleToggleActive(course)}
                  title={course.is_active ? 'Deaktivovat' : 'Aktivovat'}
                />
                <button
                  onClick={() => handleDelete(course)}
                  className="btn btn-ghost btn-xs text-error/60 hover:text-error hover:bg-error/10"
                  title="Smazat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
