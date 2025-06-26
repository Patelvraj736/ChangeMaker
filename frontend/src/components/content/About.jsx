import React, { useEffect, useState } from 'react';
import '../../assets/css/About.css';
import { FaRupeeSign } from 'react-icons/fa';
import { CgOrganisation } from "react-icons/cg";
import axios from 'axios';

const About = () => {
  const [counters, setCounters] = useState({
    ngos: 0,
    donations: 0,
  });

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stats`);
        console.log('API Response:', response.data);

        if (response.data) {
          setCounters({
            ngos: response.data.ngoCount || 0,
            donations: parseFloat(response.data.totalDonations) || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchCounters();
  }, []);

  return (
    <div className="about-page">
      <section className="section fade-in">
        <h1 className="heading">About Us</h1>
        <p className="paragraph">
          Welcome to <strong>ChangeMaker</strong>! 🌟
          We are a platform dedicated to bridging the gap between passionate individuals and trusted NGOs across India. 
          ChangeMaker allows individuals, corporations, and communities to contribute to causes they care about, whether that means donating money, volunteering time, or simply sharing a message to raise awareness. Our mission is to make the process as seamless as possible by connecting NGOs with the resources they need to make a real impact.
        </p>
        <p className="paragraph">
          Whether you wish to donate, volunteer, or simply stay informed, our platform empowers you to be a catalyst for real change. We ensure that your contributions are directed towards verified, reputable NGOs working on the ground, creating an ecosystem where people can come together to support a diverse range of causes, from education to health, environment, and beyond.
        </p>
      </section>

      <section className="stats-section fade-in">
        <div className="stat-card">
          <CgOrganisation className="stat-icon" />
          <h2>{counters.ngos}</h2>
          <p>NGOs Connected</p>
        </div>
        <div className="stat-card">
          <FaRupeeSign className="stat-icon" />
          <h2>₹{(counters.donations / 100000).toFixed(1)}L+</h2> 
          <p>Donations Raised</p>
        </div>
      </section>

      <section className="section fade-in">
        <h2 className="subheading">Our Vision 🌏</h2>
        <p className="paragraph">
          At ChangeMaker, we envision an India where every good cause receives the support it deserves. We believe that everyone has the power to make a difference, and through our platform, we aim to create a future where social causes are no longer hindered by a lack of resources or awareness.
        </p>
        <p className="paragraph">
          Our vision is to build a nation that is united in its commitment to social welfare, where citizens, corporations, and governments collaborate to tackle the pressing challenges of our time. From poverty alleviation to environmental conservation, we strive to create a world where no cause is too small to receive attention, and no person is too far removed from making an impact.
        </p>
      </section>

      <section className="section fade-in">
        <h2 className="subheading">Our Mission 🎯</h2>
        <p className="paragraph">
          Our mission is simple: to create an accessible, trustworthy platform that connects NGOs with supporters across India. We want to build a transparent ecosystem where donors, volunteers, and NGOs can find each other with ease and work together to address the most critical challenges facing society today.
        </p>
        <p className="paragraph">
          By providing detailed information about NGOs, their work, and their impact, we enable individuals to make informed decisions about where to direct their resources. Our platform fosters a sense of community and shared responsibility, helping us all come together in pursuit of a better future for India and the world.
        </p>
      </section>

      <section className="section fade-in">
        <h2 className="subheading">Explore NGOs by Category 🏆</h2>
        <ul className="list">
          <li><strong>Charitable NGOs</strong> – These organizations focus on supporting social causes such as hunger relief, education for underprivileged children, and healthcare for marginalized communities. They are dedicated to improving the quality of life for those in need.</li>
          <li><strong>Health NGOs</strong> – These NGOs are working to provide access to healthcare services for underserved populations. They address issues such as maternal health, mental health, disease prevention, and healthcare infrastructure development.</li>
          <li><strong>Education NGOs</strong> – Education is the key to empowering individuals and transforming communities. These NGOs work on improving access to education for children and adults, building schools, providing scholarships, and promoting literacy programs.</li>
          <li><strong>Environmental NGOs</strong> – Focused on sustainability and conservation, these NGOs work to protect natural resources, combat climate change, promote biodiversity, and raise awareness about the environment's critical state.</li>
        </ul>
      </section>

      <section className="section fade-in">
        <h2 className="subheading">Engage Deeply 🤝</h2>
        <ul className="list">
          <li>Read about their <strong>impact</strong> and <strong>mission</strong> – Get to know the organizations you're supporting. Learn about their vision, the challenges they face, and the tangible impact they are making on the ground. Every organization has a unique story, and understanding their work can inspire you to take action.</li>
          <li>Check <strong>reviews</strong> and <strong>donate</strong> securely – Our platform includes feedback from past donors and volunteers, giving you confidence in your decision to contribute. We ensure that all donations are processed securely, with full transparency on how funds are used.</li>
          <li>Search NGOs by <strong>Category</strong>, <strong>City</strong>, or <strong>State</strong> – Find the NGOs that are closest to your heart. Whether you want to support a local cause or contribute to a national initiative, our search tools make it easy to find organizations based on your preferences.</li>
        </ul>
      </section>

      <section className="section fade-in">
        <h2 className="subheading">Be a Part of Change 🌟</h2>
        <p className="paragraph">
          Every contribution counts — whether it’s ₹10, an hour of your time, or simply spreading the word. No matter how small your involvement may seem, your actions can help drive the change that the world desperately needs. When you contribute to a cause, you're not just donating money or time — you're investing in a future where everyone has access to the opportunities they deserve.
        </p>
        <p className="paragraph">
          The path to meaningful change begins with small steps. By engaging with ChangeMaker, you are becoming part of a larger movement that will shape the future of social impact. We encourage you to join hands with us and thousands of others who are already making a difference in their communities and across the nation.
        </p>
        <div className="find">
          <a href="/" className="button">Find NGOs Now</a>
        </div>
      </section>
    </div>
  );
};

export default About;
