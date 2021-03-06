import React, { useEffect } from 'react';
import 'styled-components/macro';
import isEmpty from 'lodash.isempty';
import { useHistory } from 'react-router-dom';

import LoadBox from '@components/LoadBox';
import notification from '@components/notification';
import { Row, Col } from '@components/Grid';
import Widget from './Widget';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function Reports({ reports, select, fetchList }) {
  const history = useHistory();
  const { isFetching, list, error } = reports;
  const showReport = reportData => {
    select(reportData);
    history.push('/relatorios/visualizar');
  };
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  if (isFetching) {
    return <LoadBox />;
  }

  return (
    <Row type="flex" gutter={[20, 20]}>
      {list.map((reportData, index) => (
        <Col key={index} span={24} md={12} lg={8}>
          <Widget css="height: 100%;" reportData={reportData} showReport={showReport} id={index} />
        </Col>
      ))}
    </Row>
  );
}
