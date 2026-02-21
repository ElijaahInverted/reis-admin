import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://zvbpgkmnrqyprtkyxkwn.supabase.co', process.env.SUPABASE_KEY);

async function testFetch(studium) {
    const { data, error } = await supabase
        .from('tutoring_matches')
        .select('*')
        .or(`tutor_studium.eq.${studium},tutee_studium.eq.${studium}`)
        .limit(1)
        .maybeSingle();
    console.log(data, error);
}

testFetch('120344').then(() => process.exit(0));
