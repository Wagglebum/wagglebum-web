import Link from "next/link";

async function getIssues() {
  const res = await fetch(
    "https://api.github.com/repos/Wagglebum/WagSave/issues?state=open",
    { next: { revalidate: 60 } } // Revalidate every minute
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function Support() {
  const issues = await getIssues();

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">WagSave Support</h1>
        <p className="text-gray-600 mb-6">
          View open issues or report a new one on our GitHub repository.
        </p>
        <Link
          href="https://github.com/Wagglebum/WagSave/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Submit an Issue
        </Link>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Open Issues</h2>
        {issues.length === 0 ? (
          <p className="text-gray-500 italic">No open issues found.</p>
        ) : (
          <ul className="space-y-4">
            {issues.map((issue: any) => (
              <li
                key={issue.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Link
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-blue-600 hover:underline">
                      {issue.title}
                    </h3>
                    <span className="text-sm text-gray-500">#{issue.number}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {issue.state}
                    </span>
                    <span className="text-xs text-gray-400">
                      opened by {issue.user.login}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
