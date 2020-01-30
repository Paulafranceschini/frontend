import withLayout from '@lib/withLayout';
import Reports from '@containers/Reports';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'Relatórios'
};

export default withLayout(Reports, layoutProps);
