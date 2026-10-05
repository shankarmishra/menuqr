import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Todo {
  id: string | number;
  name: string;
}

export default function SupabaseTest() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true);
        // Ensure you have a 'todos' table in your Supabase project with 'id' and 'name' columns
        // and Row Level Security (RLS) policies allowing SELECT operations.
        const { data, error } = await supabase.from('todos').select();

        if (error) {
          throw error;
        }

        if (data) {
          setTodos(data);
        }
      } catch (err: any) {
        console.error('Error fetching todos:', err);
        setError(err.message || 'An error occurred while fetching from Supabase');
      } finally {
        setLoading(false);
      }
    }

    getTodos();
  }, []);

  if (loading) return <div className="p-4 text-white">Loading from Supabase...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Supabase Test: Todos</h2>
      {todos.length === 0 ? (
        <p className="text-gray-400">No todos found (or RLS policy is blocking access).</p>
      ) : (
        <ul className="list-disc pl-5">
          {todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
