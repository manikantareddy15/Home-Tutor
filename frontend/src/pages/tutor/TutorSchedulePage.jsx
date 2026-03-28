const TutorSchedulePage = () => <div className='card'><h3 className='font-semibold mb-2'>Weekly Schedule</h3><div className='grid grid-cols-7 gap-2 text-xs'>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div key={d} className='border rounded p-4 text-center bg-slate-50'>{d}</div>)}</div></div>;
export default TutorSchedulePage;
