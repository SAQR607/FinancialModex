const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* About MODEX Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About MODEX Academy</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Empowering the next generation of financial professionals through innovative
            competition and comprehensive learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-modex-dark">Our Mission</h2>
            <div className="card">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                MODEX Academy is dedicated to fostering excellence in financial modeling and analysis.
                We believe that practical, hands-on experience is the best way to develop real-world skills
                that matter in today's competitive financial landscape.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Through our competition platform, we bring together talented individuals and teams to
                solve complex financial challenges, learn from industry experts, and build a network
                of like-minded professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Philosophy */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-modex-dark">Competition Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-modex-light">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every aspect of our competition, from the quality of
                  challenges to the fairness of evaluation.
                </p>
              </div>
              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-modex-teal">Learning</h3>
                <p className="text-gray-600">
                  Every participant gains valuable experience and knowledge, regardless of the final outcome.
                </p>
              </div>
              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-modex-light">Collaboration</h3>
                <p className="text-gray-600">
                  We believe in the power of teamwork and encourage collaboration among participants.
                </p>
              </div>
              <div className="card">
                <h3 className="text-2xl font-semibold mb-4 text-modex-teal">Innovation</h3>
                <p className="text-gray-600">
                  We embrace innovative approaches to financial modeling and analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-modex-dark">Our Values</h2>
            <div className="card">
              <ul className="text-left space-y-4 text-lg text-gray-700">
                <li className="flex items-start">
                  <span className="text-modex-light mr-3">✓</span>
                  <span><strong>Integrity:</strong> We maintain the highest standards of honesty and transparency.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-modex-light mr-3">✓</span>
                  <span><strong>Excellence:</strong> We pursue excellence in everything we do.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-modex-light mr-3">✓</span>
                  <span><strong>Innovation:</strong> We continuously innovate to stay ahead of the curve.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-modex-light mr-3">✓</span>
                  <span><strong>Community:</strong> We build a strong, supportive community of professionals.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

