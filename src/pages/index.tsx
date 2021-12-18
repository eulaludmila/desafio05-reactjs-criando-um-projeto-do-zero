import { GetStaticProps } from 'next';
import Link from 'next/link'
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import {FiUser} from 'react-icons/fi';
import {AiOutlineCalendar} from 'react-icons/ai';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  console.log('postsPagination: ', postsPagination);
  return(
    <main className={styles.contentContainer}>
      <div className={styles.listPosts}>
      {postsPagination.map(post => (
        <Link href={`post/${post.uid}`} key={post.uid}>
          <a>
          <h2>{post.data.title}</h2>
          <p>{post.data.subtitle}</p>
          <div>
            <span>
              <AiOutlineCalendar size={16}/>
              {post.first_publication_date}
            </span>
            <span>
              <FiUser size={16}/>
              {post.data.author}
            </span>
          </div>
        </a>
        </Link>
      ))}
      {postsPagination.map(post => (
        <Link href={`post/${post.uid}`} key={post.uid}>
          <a>
          <h2>{post.data.title}</h2>
          <p>{post.data.subtitle}</p>
          <div>
            <span>
              <AiOutlineCalendar size={16}/>
              {post.first_publication_date}
            </span>
            <span>
              <FiUser size={16}/>
              {post.data.author}
            </span>
          </div>
        </a>
        </Link>
      ))}
      </div>
    </main>
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ], {
    fetch:['post.title', 'post.subtitle', 'post.author', 'post.last_publication_date'],
    pageSize: 2,
  });

  const postsPagination = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
      // content: post.data.content.map(content => ({heading: content.heading, body: RichText.asHtml(content.body)})),
    }
  })
  return {
    props: {postsPagination}
  }
};
