import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import styled from 'styled-components/macro';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { toDataSource } from '@utils';
import { getUniqueDrugs } from '@utils/transformers';
import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import { Row, Col } from '@components/Grid';
import notification from '@components/notification';
import Tabs from '@components/Tabs';
import Tag from '@components/Tag';
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';

import Modal from './Modal';
import PrescriptionDrugModal from './PrescriptionDrugModal';
import Patient from './Patient';
import columnsTable, { expandedRowRender, solutionColumns, groupSolutions } from './columns';
import interventionColumns, { expandedInterventionRowRender } from './Intervention/columns';
import examColumns, { examRowClassName, expandedExamRowRender } from './Exam/columns';

// extract idPrescription from slug.
const extractId = slug => slug.match(/([0-9]+)$/)[0];

// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};
// save message when saved intervention.
const saveMessage = {
  message: 'Uhu! Intervenção salva com sucesso! :)'
};
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

const ScreeningTabs = styled(Tabs)`
  .ant-tabs-nav {
    width: 100%;
  }

  .ant-tabs-nav .ant-tabs-tab:nth-child(4) {
    margin-left: 50px !important;
  }
`;

export default function Screening({
  match,
  prescription,
  maybeCreateOrUpdate,
  save,
  reset,
  select,
  fetchScreeningById,
  savePrescriptionDrugStatus,
  updateInterventionData,
  updatePrescriptionDrugData,
  saveInterventionStatus,
  fetchPeriod,
  fetchExams,
  prescriptionDrug,
  savePrescriptionDrug,
  selectPrescriptionDrug
}) {
  const id = extractId(match.params.slug);
  const { isFetching, content, error, exams } = prescription;
  const {
    prescription: drugList,
    solution: solutionList,
    procedures: proceduresList,
    interventions: interventionList
  } = content;
  const { isSaving, wasSaved, item } = maybeCreateOrUpdate;

  const [visible, setVisibility] = useState(false);
  const [openPrescriptionDrugModal, setOpenPrescriptionDrugModal] = useState(false);

  const columns = useMedia(
    [`(min-width: ${breakpoints.lg})`],
    [[...columnsTable]],
    [...columnsTable]
  );
  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);

  const onSave = () => save(item);
  const onCancel = () => {
    select({});
    setVisibility(false);
  };
  const onShowModal = data => {
    select(data);
    setVisibility(true);
  };

  const onSavePrescriptionDrug = () =>
    savePrescriptionDrug(prescriptionDrug.item.idPrescriptionDrug, prescriptionDrug.item);
  const onCancelPrescriptionDrug = () => {
    selectPrescriptionDrug({});
    setOpenPrescriptionDrugModal(false);
  };
  const onShowPrescriptionDrugModal = data => {
    selectPrescriptionDrug(data);
    setOpenPrescriptionDrugModal(true);
  };

  const isSaveBtnDisabled = item => {
    if (isEmpty(item)) {
      return true;
    }

    if (isEmpty(item.intervention.idInterventionReason)) {
      return true;
    }

    return false;
  };

  // extra resources to add in table item.
  const bag = {
    onShowModal,
    onShowPrescriptionDrugModal,
    check: prescription.checkPrescriptionDrug,
    savePrescriptionDrugStatus,
    idSegment: content.idSegment,
    uniqueDrugList: getUniqueDrugs(drugList, solutionList, proceduresList),
    admissionNumber: content.admissionNumber,
    saveInterventionStatus,
    checkIntervention: prescription.checkIntervention,
    periodObject: prescription.periodObject,
    fetchPeriod
  };

  const dataSource = toDataSource(drugList, 'idPrescriptionDrug', {
    ...bag,
    prescriptionType: 'prescriptions'
  });
  const dsSolutions = groupSolutions(
    toDataSource(solutionList, 'idPrescriptionDrug', {
      ...bag,
      prescriptionType: 'solutions'
    })
  );
  const dsProcedures = toDataSource(proceduresList, 'idPrescriptionDrug', {
    ...bag,
    prescriptionType: 'procedures'
  });
  const dsInterventions = toDataSource(interventionList, 'id', {
    saveInterventionStatus,
    check: prescription.checkIntervention
  });
  const dsExams = toDataSource(exams.list, 'key', {});

  const listCount = {
    prescriptions: drugList ? drugList.length : 0,
    solutions: solutionList ? solutionList.length : 0,
    procedures: proceduresList ? proceduresList.length : 0,
    interventions: interventionList
      ? interventionList.reduce((n, i) => n + (i.status === 's'), 0)
      : 0
  };

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  // handle after save intervention.
  useEffect(() => {
    if (wasSaved) {
      updateInterventionData(item.idPrescriptionDrug, item.source, item.intervention);
      reset();
      setVisibility(false);

      notification.success(saveMessage);
    }
  }, [wasSaved, id, reset, item, updateInterventionData]);

  useEffect(() => {
    if (prescriptionDrug.success) {
      updatePrescriptionDrugData(
        prescriptionDrug.item.idPrescriptionDrug,
        prescriptionDrug.item.source,
        prescriptionDrug.item
      );
      setOpenPrescriptionDrugModal(false);

      notification.success({ message: 'Uhu! Anotação salva com sucesso' });
    }
  }, [prescriptionDrug.success, updatePrescriptionDrugData, prescriptionDrug.item]);

  const rowClassName = (record, index) => {
    let classes = [];
    if (!record.idPrescriptionDrug) {
      classes.push('divider-row');
    }

    if (record.suspended) {
      classes.push('suspended');
    }

    if (record.checked & isEmpty(record.prevIntervention)) {
      classes.push('checked');
    }

    if (isEmpty(record.route)) {
      classes.push('checked');
    }

    if (record.status === 's') {
      classes.push('danger');
    }

    return classes.join(' ');
  };

  const TabTitle = ({ title, count, ...props }) => (
    <>
      <span style={{ marginRight: '10px' }}>{title}</span>
      {count >= 0 ? <Tag {...props}>{count}</Tag> : null}
    </>
  );

  const loadExams = () => {
    if (isEmpty(exams.list)) {
      fetchExams(content.admissionNumber, { idSegment: content.idSegment });
    }
  };

  const onTabClick = key => {
    if (key === '5') {
      loadExams();
    }
  };

  const InterventionFooter = () => {
    const isChecked = item.status === 's';

    const undoIntervention = () => {
      savePrescriptionDrugStatus(item.idPrescriptionDrug, '0', item.source);
      setVisibility(false);
    };

    return (
      <>
        <Button onClick={() => onCancel()} disabled={isSaving} className="gtm-bt-cancel-interv">
          Cancelar
        </Button>
        {isChecked && (
          <Tooltip title="Desfazer intervenção" placement="top">
            <Button
              type="danger gtm-bt-undo-interv"
              ghost
              loading={prescription.checkPrescriptionDrug.isChecking}
              onClick={() => undoIntervention()}
            >
              <Icon type="rollback" style={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        )}

        <Button
          type="primary gtm-bt-save-interv"
          onClick={() => onSave()}
          disabled={isSaving || isSaveBtnDisabled(item)}
          loading={isSaving}
        >
          Salvar
        </Button>
      </>
    );
  };

  if (error) {
    return null;
  }

  return (
    <>
      <Row type="flex" gutter={24}>
        <Col span={24} md={24}>
          {isFetching ? <LoadBox /> : <Patient {...content} fetchScreening={fetchScreeningById} />}
        </Col>
        <ScreeningTabs
          defaultActiveKey="1"
          style={{ width: '100%', marginTop: '20px' }}
          type="card gtm-tab-screening"
          onTabClick={onTabClick}
        >
          <Tabs.TabPane
            tab={<TabTitle title="Medicamentos" count={listCount.prescriptions} />}
            key="1"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={columns}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhuma prescrição encontrada."
                    />
                  )
                }}
                dataSource={!isFetching ? dataSource : []}
                expandedRowRender={expandedRowRender}
                rowClassName={rowClassName}
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title="Soluções" count={listCount.solutions} />} key="2">
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={solutionColumns}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhuma solução encontrada."
                    />
                  )
                }}
                dataSource={!isFetching ? dsSolutions : []}
                expandedRowRender={expandedRowRender}
                rowClassName={rowClassName}
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<TabTitle title="Procedimentos/Exames" count={listCount.procedures} />}
            key="3"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={columns}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhum procedimento/exame encontrado."
                    />
                  )
                }}
                dataSource={!isFetching ? dsProcedures : []}
                expandedRowRender={expandedRowRender}
                rowClassName={rowClassName}
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <TabTitle
                title="Intervenções Anteriores"
                color={listCount.interventions > 0 ? 'orange' : null}
                count={listCount.interventions}
              />
            }
            key="4"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={interventionColumns}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhuma intervenção encontrada."
                    />
                  )
                }}
                dataSource={!isFetching ? dsInterventions : []}
                expandedRowRender={expandedInterventionRowRender}
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title="Exames" />} key="5">
            <ExpandableTable
              title={title}
              columns={examColumns}
              pagination={false}
              loading={exams.isFetching}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Nenhum exame encontrado."
                  />
                )
              }}
              dataSource={!exams.isFetching ? dsExams : []}
              rowClassName={examRowClassName}
              expandedRowRender={expandedExamRowRender}
            />
          </Tabs.TabPane>
        </ScreeningTabs>
      </Row>

      <Modal visible={visible} confirmLoading={isSaving} footer={<InterventionFooter />} />
      <PrescriptionDrugModal
        onOk={onSavePrescriptionDrug}
        visible={openPrescriptionDrugModal}
        onCancel={onCancelPrescriptionDrug}
        confirmLoading={prescriptionDrug.isSaving}
        okButtonProps={{
          disabled: isSaving
        }}
        cancelButtonProps={{
          disabled: isSaving,
          className: 'gtm-bt-cancel-notes'
        }}
        okText="Salvar"
        okType="primary gtm-bt-save-notes"
        cancelText="Cancelar"
      />
    </>
  );
}
